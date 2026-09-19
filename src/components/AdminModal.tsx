import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Clock, 
  Activity, 
  Search, 
  Check, 
  Ban, 
  Trash2, 
  Edit3, 
  Sparkles, 
  RefreshCw,
  FileText,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  adminUpdateUserStatus, 
  adminUpdateUserPlan, 
  adminUpdateUserRole, 
  adminUpdateUserNotes, 
  adminDeleteUser,
  SUPER_ADMIN_EMAIL 
} from '../lib/authService';
import { UserProfile, UserStatus, UserPlan, UserRole } from '../types';

interface AdminModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen = true,
  onClose,
  currentUser,
}) => {
  if (!isOpen) return null;

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Note editing state
  const [editingNotesUid, setEditingNotesUid] = useState<string | null>(null);
  const [currentNoteText, setCurrentNoteText] = useState('');

  // Real-time listener for the users collection
  useEffect(() => {
    setLoading(true);
    const usersCol = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersCol,
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), uid: docSnap.id } as UserProfile);
        });
        // Sort: pending first, then by createdAt desc
        list.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (b.status === 'pending' && a.status !== 'pending') return 1;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        setUsers(list);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao listar usuários no Firestore:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  const handleStatusChange = async (uid: string, status: UserStatus, email: string) => {
    try {
      await adminUpdateUserStatus(uid, status);
      showToast(`Status de ${email} atualizado para ${status.toUpperCase()}!`);
    } catch (err: any) {
      showToast(`Erro ao atualizar status: ${err.message}`);
    }
  };

  const handlePlanChange = async (uid: string, plan: UserPlan, email: string) => {
    try {
      await adminUpdateUserPlan(uid, plan);
      showToast(`Plano de ${email} alterado para ${plan.toUpperCase()}`);
    } catch (err: any) {
      showToast(`Erro ao atualizar plano: ${err.message}`);
    }
  };

  const handleRoleChange = async (uid: string, role: UserRole, email: string) => {
    try {
      await adminUpdateUserRole(uid, role);
      showToast(`Função de ${email} alterada para ${role.toUpperCase()}`);
    } catch (err: any) {
      showToast(`Erro ao atualizar função: ${err.message}`);
    }
  };

  const handleSaveNotes = async (uid: string) => {
    try {
      await adminUpdateUserNotes(uid, currentNoteText);
      setEditingNotesUid(null);
      showToast('Nota interna salva com sucesso!');
    } catch (err: any) {
      showToast(`Erro ao salvar notas: ${err.message}`);
    }
  };

  const handleDelete = async (uid: string, email: string) => {
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      showToast('O Super Administrador não pode ser excluído.');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o usuário ${email}?`)) {
      try {
        await adminDeleteUser(uid);
        showToast(`Usuário ${email} removido com sucesso.`);
      } catch (err: any) {
        showToast(`Erro ao excluir usuário: ${err.message}`);
      }
    }
  };

  // Metrics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const pendingUsers = users.filter((u) => u.status === 'pending').length;
  const totalExecutions = users.reduce((acc, u) => acc + (u.usageCount || 0), 0);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : u.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-10">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 md:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
                  Painel de Assinaturas & Acessos
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                  Admin Realtime
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Gerencie assinaturas, aprove solicitações em tempo real e audite execuções da plataforma Semântico.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Feedback */}
        {toastMsg && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shrink-0 animate-in slide-in-from-top duration-150">
            <span>{toastMsg}</span>
            <button onClick={() => setToastMsg(null)} className="hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                <span>Total de Usuários</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{totalUsers}</div>
              <div className="text-[10px] text-slate-400 mt-1">Registrados no Firestore</div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-emerald-700 text-xs font-medium mb-1">
                <span>Assinantes Ativos</span>
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-900">{activeUsers}</div>
              <div className="text-[10px] text-emerald-700 mt-1">Com acesso liberado</div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-amber-800 text-xs font-medium mb-1">
                <span>Pendentes de Aprovação</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                <span>{pendingUsers}</span>
                {pendingUsers > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <div className="text-[10px] text-amber-700 mt-1">Aguardando desbloqueio</div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-blue-700 text-xs font-medium mb-1">
                <span>Total de Execuções</span>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-900">{totalExecutions}</div>
              <div className="text-[10px] text-blue-700 mt-1">Gerações realizadas</div>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, e-mail..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Status:</span>
              {(['all', 'pending', 'active', 'blocked'] as const).map((filter) => {
                const label =
                  filter === 'all'
                    ? `Todos (${totalUsers})`
                    : filter === 'pending'
                    ? `Pendentes (${pendingUsers})`
                    : filter === 'active'
                    ? `Ativos (${activeUsers})`
                    : `Bloqueados (${users.filter((u) => u.status === 'blocked').length})`;

                const isActive = statusFilter === filter;

                return (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Users Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-4">Usuário</th>
                    <th className="py-3 px-4">Função</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Plano</th>
                    <th className="py-3 px-4 text-center">Uso</th>
                    <th className="py-3 px-4">Anotações Internas</th>
                    <th className="py-3 px-4 text-right">Ações em 1 Clique</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                        Carregando usuários em tempo real...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Nenhum usuário encontrado com os filtros atuais.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSuper = u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

                      return (
                        <tr key={u.uid} className="hover:bg-slate-50/80 transition-colors">
                          {/* User Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                                {(u.displayName || u.email || 'U')[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                  <span>{u.displayName || 'Sem nome'}</span>
                                  {isSuper && (
                                    <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                      Super Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role Selector */}
                          <td className="py-3 px-4">
                            {isSuper ? (
                              <span className="font-bold text-amber-700 text-xs">admin</span>
                            ) : (
                              <select
                                value={u.role}
                                onChange={(e) =>
                                  handleRoleChange(u.uid, e.target.value as UserRole, u.email)
                                }
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                              >
                                <option value="client">client</option>
                                <option value="admin">admin</option>
                              </select>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-4">
                            {u.status === 'active' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <Check className="w-3 h-3 text-emerald-600" />
                                Ativo
                              </span>
                            )}
                            {u.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Pendente
                              </span>
                            )}
                            {u.status === 'blocked' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                                <Ban className="w-3 h-3 text-red-600" />
                                Bloqueado
                              </span>
                            )}
                            {u.status === 'expired' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                <AlertTriangle className="w-3 h-3 text-slate-500" />
                                Expirado
                              </span>
                            )}
                          </td>

                          {/* Plan Selector */}
                          <td className="py-3 px-4">
                            <select
                              value={u.plan}
                              onChange={(e) =>
                                handlePlanChange(u.uid, e.target.value as UserPlan, u.email)
                              }
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                            >
                              <option value="trial">Trial</option>
                              <option value="monthly">Mensal</option>
                              <option value="annual">Anual</option>
                              <option value="lifetime">Lifetime</option>
                            </select>
                          </td>

                          {/* Usage Count */}
                          <td className="py-3 px-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-md font-mono font-bold bg-slate-100 text-slate-800 text-xs">
                              {u.usageCount || 0}
                            </span>
                          </td>

                          {/* Internal Notes */}
                          <td className="py-3 px-4">
                            {editingNotesUid === u.uid ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={currentNoteText}
                                  onChange={(e) => setCurrentNoteText(e.target.value)}
                                  placeholder="Anotação..."
                                  className="w-36 py-1 px-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveNotes(u.uid)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-sm"
                                  title="Salvar"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingNotesUid(null)}
                                  className="p-1 text-slate-400 hover:bg-slate-100 rounded-sm"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div 
                                onClick={() => {
                                  setEditingNotesUid(u.uid);
                                  setCurrentNoteText(u.notes || '');
                                }}
                                className="group cursor-pointer flex items-center gap-1 text-slate-600 hover:text-slate-900"
                                title="Clique para editar notas"
                              >
                                <span className="truncate max-w-[160px] text-[11px]">
                                  {u.notes || <em className="text-slate-400">Adicionar nota...</em>}
                                </span>
                                <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-amber-600 shrink-0" />
                              </div>
                            )}
                          </td>

                          {/* Quick 1-Click Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {u.status !== 'active' ? (
                                <button
                                  onClick={() => handleStatusChange(u.uid, 'active', u.email)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] shadow-xs flex items-center gap-1 transition-colors"
                                  title="Aprovar e Liberar Acesso Imediatamente"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Aprovar</span>
                                </button>
                              ) : (
                                !isSuper && (
                                  <button
                                    onClick={() => handleStatusChange(u.uid, 'blocked', u.email)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-lg text-[11px] font-medium border border-slate-200 transition-colors"
                                    title="Bloquear Acesso"
                                  >
                                    Bloquear
                                  </button>
                                )
                              )}

                              {!isSuper && (
                                <button
                                  onClick={() => handleDelete(u.uid, u.email)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Excluir Usuário"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              Qualquer alteração de status reflete <strong>instantaneamente</strong> na tela do cliente sem recarregar a página.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs transition-colors"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
