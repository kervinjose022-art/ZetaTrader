import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  DollarSign,
  Lock,
  Mail,
  Trash2,
  UserPlus,
  PlusCircle,
  MinusCircle,
  Search,
  TrendingUp,
  TrendingDown,
  LogOut,
  Maximize2,
  Minimize2,
  Calendar,
  Check
} from 'lucide-react';
import { BrokerUser } from './BrokerAuthModal';

interface BrokerAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: BrokerUser[];
  onUpdateUserBalance: (userId: string, newRealBalance: number) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onAddUser: (user: BrokerUser) => void;
}

export const BrokerAdminModal: React.FC<BrokerAdminModalProps> = ({
  isOpen,
  onClose,
  users,
  onUpdateUserBalance,
  onToggleUserStatus,
  onDeleteUser,
  onAddUser
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Inline balance adjust state
  const [editingBalanceUserId, setEditingBalanceUserId] = useState<string | null>(null);
  const [adjustMode, setAdjustMode] = useState<'add' | 'sub'>('add');
  const [adjustAmount, setAdjustAmount] = useState<string>('100');

  // Inline delete confirmation state
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);

  // New user form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newInitialBalance, setNewInitialBalance] = useState<number>(100);

  if (!isOpen) return null;

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (emailInput.trim().toLowerCase() === 'kervinjose022@gmail.com' && passwordInput === '1910') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Credenciales de Administrador incorrectas.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRealCapital = users.reduce((acc, u) => acc + (u.realBalance || 0), 0);
  const totalDemoCapital = users.reduce((acc, u) => acc + (u.demoBalance || 0), 0);
  const totalCombinedCapital = totalRealCapital + totalDemoCapital;
  const totalProfits = users.reduce((acc, u) => acc + (u.totalProfit || 0), 0);
  const totalLosses = users.reduce((acc, u) => acc + (u.totalLoss || 0), 0);
  const activeUsersCount = users.filter((u) => u.status === 'active').length;

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newUser: BrokerUser = {
      id: `usr_adm_${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      password: newPassword.trim() || '123456',
      realBalance: newInitialBalance,
      demoBalance: 10000,
      totalProfit: 0,
      totalLoss: 0,
      role: 'user',
      status: 'active',
      createdAt: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      tradesCount: 0,
      wonTradesCount: 0
    };

    onAddUser(newUser);
    setShowAddForm(false);
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewInitialBalance(100);
  };

  const handleApplyBalanceAdjust = (user: BrokerUser) => {
    const val = Number(adjustAmount);
    if (!isNaN(val) && val > 0) {
      const currentReal = user.realBalance || 0;
      const nextReal = adjustMode === 'add' ? currentReal + val : Math.max(0, currentReal - val);
      onUpdateUserBalance(user.id, Math.round(nextReal * 100) / 100);
    }
    setEditingBalanceUserId(null);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in ${
        isExpanded ? 'p-0 sm:p-2' : 'p-3 md:p-6'
      }`}
    >
      <div
        className={`relative bg-[#090f1e] border border-amber-500/40 shadow-2xl text-white flex flex-col overflow-hidden transition-all ${
          isExpanded
            ? 'w-full h-full sm:w-[98vw] sm:h-[96vh] rounded-none sm:rounded-2xl p-4 sm:p-6'
            : 'w-full max-w-6xl h-[90vh] rounded-3xl p-5 md:p-7'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-base sm:text-lg text-white truncate">
                  Panel de Control — Usuarios Registrados
                </h3>
                <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-black">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Saldos totales, ganancias, pérdidas, correos y fecha de inicio de cuenta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Reducir ventana' : 'Maximizar ventana'}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Authenticated State */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center py-6">
            <div className="max-w-md w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="font-black text-base text-white">Acceso Restringido al Sistema</h4>
                <p className="text-xs text-slate-400">
                  Introduce tus credenciales de Administrador para ver usuarios, saldos, ganancias y pérdidas.
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Correo de Administrador
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="kervinjose022@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Contraseña de Acceso
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-black text-sm uppercase bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Desbloquear Panel
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="mt-4 flex-1 flex flex-col gap-3.5 min-h-0 overflow-hidden">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
              <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400">
                  <span>Usuarios Registrados</span>
                  <Users className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
                  {users.length}
                </div>
                <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                  {activeUsersCount} activos · {users.length - activeUsersCount} suspendidos
                </div>
              </div>

              <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400">
                  <span>Saldo Total Global</span>
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-1">
                  ${totalCombinedCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Real: ${totalRealCapital.toFixed(2)} · Demo: ${totalDemoCapital.toFixed(2)}
                </div>
              </div>

              <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-emerald-500/25">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400">
                  <span>Ganancias Totales</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
                  +${totalProfits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-emerald-500/80 font-semibold mt-0.5">
                  Acumulado operaciones ganadas
                </div>
              </div>

              <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-rose-500/25">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400">
                  <span>Pérdidas Totales</span>
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono mt-1">
                  -${totalLosses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-rose-400/80 font-semibold mt-0.5">
                  Acumulado operaciones perdidas
                </div>
              </div>
            </div>

            {/* Actions Bar & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="hidden md:flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-[11px]">
                  {(
                    [
                      { id: 'all', label: 'Todos' },
                      { id: 'active', label: 'Activos' },
                      { id: 'suspended', label: 'Suspendidos' }
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setStatusFilter(f.id)}
                      className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                        statusFilter === f.id
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>{showAddForm ? 'Cancelar' : 'Registrar Nuevo Usuario'}</span>
              </button>
            </div>

            {/* Create User Form Drawer */}
            {showAddForm && (
              <form
                onSubmit={handleCreateUser}
                className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 animate-fade-in text-xs shrink-0"
              >
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Correo</label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Contraseña</label>
                  <input
                    type="text"
                    placeholder="123456"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Saldo Real Inicial ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newInitialBalance}
                    onChange={(e) => setNewInitialBalance(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg transition-all cursor-pointer"
                  >
                    Guardar Usuario
                  </button>
                </div>
              </form>
            )}

            {/* Large Scrollable Users Table */}
            <div className="flex-1 min-h-0 overflow-auto border border-slate-800 rounded-2xl bg-slate-950/70 scrollbar-thin">
              <table className="w-full min-w-[920px] text-left text-xs">
                <thead className="bg-[#0b1222] text-slate-400 border-b border-slate-800 sticky top-0 z-10 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Usuario / Correo Electrónico</th>
                    <th className="p-3.5">Saldo Total (Real + Demo)</th>
                    <th className="p-3.5">Ganancias</th>
                    <th className="p-3.5">Pérdidas</th>
                    <th className="p-3.5">Fecha de Inicio</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-right">Acciones Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500 text-sm">
                        No se encontraron usuarios registrados con ese criterio.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const realBal = user.realBalance || 0;
                      const demoBal = user.demoBalance || 0;
                      const totalBal = realBal + demoBal;
                      const profit = user.totalProfit || 0;
                      const loss = user.totalLoss || 0;
                      const netPnl = profit - loss;
                      const won = user.wonTradesCount || 0;
                      const totalTrades = user.tradesCount || 0;
                      const lostTrades = Math.max(0, totalTrades - won);

                      return (
                        <tr key={user.id} className="hover:bg-slate-900/60 transition-colors align-middle">
                          {/* Usuario / Correo */}
                          <td className="p-3.5">
                            <div className="font-bold text-white text-sm flex items-center gap-1.5 flex-wrap">
                              <span>{user.name}</span>
                              {user.role === 'admin' && (
                                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded text-[9px] font-mono font-black">
                                  ADMIN
                                </span>
                              )}
                              {user.role === 'vip' && (
                                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded text-[9px] font-mono font-black">
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{user.email}</span>
                            </div>
                          </td>

                          {/* Saldo Total */}
                          <td className="p-3.5">
                            <div className="font-mono font-black text-white text-sm">
                              ${totalBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-[11px] font-mono mt-0.5 flex items-center gap-2">
                              <span className="text-emerald-400 font-semibold">
                                Real: ${realBal.toFixed(2)}
                              </span>
                              <span className="text-slate-600">·</span>
                              <span className="text-slate-400">Demo: ${demoBal.toFixed(2)}</span>
                            </div>
                          </td>

                          {/* Ganancias */}
                          <td className="p-3.5">
                            <div className="font-mono font-black text-emerald-400 text-sm">
                              +${profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {won} ops ganadas
                            </div>
                          </td>

                          {/* Pérdidas */}
                          <td className="p-3.5">
                            <div className="font-mono font-black text-rose-400 text-sm">
                              -${loss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {lostTrades} ops perdidas · Neto:{' '}
                              <span className={netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {netPnl >= 0 ? `+$${netPnl.toFixed(2)}` : `-$${Math.abs(netPnl).toFixed(2)}`}
                              </span>
                            </div>
                          </td>

                          {/* Fecha de Inicio */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 text-slate-200 font-mono text-xs">
                              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>{user.createdAt}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {totalTrades} operaciones totales
                            </div>
                          </td>

                          {/* Estado */}
                          <td className="p-3.5">
                            <button
                              onClick={() => onToggleUserStatus(user.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-colors ${
                                user.status === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                              }`}
                            >
                              {user.status === 'active' ? 'ACTIVO' : 'SUSPENDIDO'}
                            </button>
                          </td>

                          {/* Acciones Admin */}
                          <td className="p-3.5 text-right">
                            {editingBalanceUserId === user.id ? (
                              <div className="inline-flex items-center gap-1 bg-slate-900 border border-amber-500/40 rounded-xl p-1">
                                <span className="text-[10px] font-bold px-1 text-slate-300">
                                  {adjustMode === 'add' ? '+$' : '-$'}
                                </span>
                                <input
                                  type="number"
                                  min="1"
                                  value={adjustAmount}
                                  onChange={(e) => setAdjustAmount(e.target.value)}
                                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-1.5 py-1 text-xs font-mono text-white outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleApplyBalanceAdjust(user)}
                                  className="p-1 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer"
                                  title="Aplicar"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingBalanceUserId(null)}
                                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : confirmDeleteUserId === user.id ? (
                              <div className="inline-flex items-center gap-1 bg-rose-950/70 border border-rose-500/40 rounded-xl px-2 py-1">
                                <span className="text-[10px] text-rose-300 font-bold">¿Eliminar?</span>
                                <button
                                  onClick={() => {
                                    onDeleteUser(user.id);
                                    setConfirmDeleteUserId(null);
                                  }}
                                  className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-black cursor-pointer hover:bg-rose-400"
                                >
                                  Sí
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteUserId(null)}
                                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold cursor-pointer hover:bg-slate-700"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingBalanceUserId(user.id);
                                    setAdjustMode('add');
                                    setAdjustAmount('100');
                                  }}
                                  title="Recargar Saldo Real"
                                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors cursor-pointer"
                                >
                                  <PlusCircle className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => {
                                    setEditingBalanceUserId(user.id);
                                    setAdjustMode('sub');
                                    setAdjustAmount('50');
                                  }}
                                  title="Restar Saldo Real"
                                  className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                                >
                                  <MinusCircle className="w-4 h-4" />
                                </button>

                                {user.email !== 'kervinjose022@gmail.com' && (
                                  <button
                                    onClick={() => setConfirmDeleteUserId(user.id)}
                                    title="Eliminar Usuario"
                                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
