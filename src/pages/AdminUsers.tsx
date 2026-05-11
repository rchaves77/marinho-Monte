import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  Mail, 
  Calendar,
  Check,
  X,
  Loader2,
  Settings2,
  Trash2
} from 'lucide-react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../lib/AuthContext';

export default function AdminUsers() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await dataService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId: string, status: 'active' | 'revoked', role?: string) => {
    setUpdating(userId);
    try {
      await dataService.updateUserStatus(userId, status, role);
      await fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ShieldCheck className="mx-auto text-slate-200 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-400">Acesso Restrito ao Administrador Geral</h2>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">Gestão de Acessos</h1>
          <p className="text-slate-500 mt-1">Admita, revogue e gerencie perfis de acesso ao sistema.</p>
        </div>
        <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <Settings2 size={16} /> Painel Administrador
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Perfil</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="animate-spin text-slate-300 mx-auto" size={32} />
                    </td>
                 </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase overflow-hidden">
                        {user.displayName?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-[#0f172a] text-sm">{user.displayName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Desde {new Date(user.createdAt?.toDate()).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Mail size={14} />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <select 
                        value={user.role}
                        onChange={(e) => handleUpdateStatus(user.id, user.status, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                      >
                        <option value="professional">Profissional</option>
                        <option value="administrative">Administrativo</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        user.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 
                        user.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {user.status === 'active' ? 'Ativo' : user.status === 'pending' ? 'Pendente' : 'Suspenso'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {user.status === 'pending' || user.status === 'revoked' ? (
                         <button 
                            onClick={() => handleUpdateStatus(user.id, 'active')}
                            disabled={updating === user.id}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider"
                          >
                           {updating === user.id ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />} Admitir
                         </button>
                       ) : (
                        <button 
                          onClick={() => handleUpdateStatus(user.id, 'revoked')}
                          disabled={updating === user.id}
                          className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider"
                        >
                          {updating === user.id ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />} Suspender
                        </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
