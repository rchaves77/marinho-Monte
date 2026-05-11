import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, UserPlus, ShieldAlert, Clock, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { dataService } from '../lib/dataService';

export default function Login() {
  const { user, profile, signIn, signOut, refreshProfile } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'professional' | 'administrative'>('professional');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await dataService.registerUser(user.uid, {
        email: user.email!,
        displayName: user.displayName || 'Usuário',
        role: selectedRole
      });
      await refreshProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // State: Not Logged In
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-10 border border-slate-100"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-indigo-100">
              <LogIn size={32} />
            </div>
            <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">Bem-vindo(a)</h2>
            <p className="text-slate-500 mt-2 font-medium">Acesse o sistema hospitalar odontológico.</p>
          </div>

          <button 
            onClick={signIn}
            className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 invert" />
            Entrar com Google
          </button>

          <p className="mt-8 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
            Acesso Restrito a Colaboradores
          </p>
        </motion.div>
      </div>
    );
  }

  // State: Logged in but no profile (First Access)
  if (!profile && user.email !== 'romulochaves77@gmail.com') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-slate-100"
        >
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500 p-0.5">
              <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-full h-full rounded-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Olá,</p>
              <p className="font-bold text-[#0f172a]">{user.displayName}</p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-[#0f172a] mb-2">Primeiro Acesso?</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Seu e-mail ainda não está vinculado a um perfil. Escolha sua função para solicitar acesso ao administrador.
          </p>

          <div className="space-y-4 mb-8">
            <button 
              onClick={() => setSelectedRole('professional')}
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                selectedRole === 'professional' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedRole === 'professional' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'
                }`}>
                  <ShieldAlert size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm text-[#0f172a]">Profissional de Saúde</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Clínica e Prontuários</p>
                </div>
              </div>
              {selectedRole === 'professional' && <CheckCircle2 size={20} className="text-indigo-600" />}
            </button>

            <button 
              onClick={() => setSelectedRole('administrative')}
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                selectedRole === 'administrative' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedRole === 'administrative' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'
                }`}>
                  <UserPlus size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm text-[#0f172a]">Administrativo</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Relatórios e Consultas</p>
                </div>
              </div>
              {selectedRole === 'administrative' && <CheckCircle2 size={20} className="text-indigo-600" />}
            </button>
          </div>

          <button 
            onClick={handleRegister}
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {submitting ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} />}
            Solicitar Acesso
          </button>

          <button onClick={signOut} className="w-full mt-4 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-rose-500 transition-colors">
            Sair e trocar conta
          </button>
        </motion.div>
      </div>
    );
  }

  // State: Pending
  if (profile.status === 'pending' && user.email !== 'romulochaves77@gmail.com') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-slate-100 text-center"
        >
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-8">
            <Clock size={40} />
          </div>
          <h3 className="text-2xl font-bold text-[#0f172a] mb-3">Solicitação Enviada</h3>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed px-4">
            Seu pedido de acesso está em análise. O administrador geral irá conceder as permissões em breve.
          </p>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8 inline-block w-full">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Perfil solicitado</p>
            <p className="font-bold text-indigo-600 uppercase tracking-wider">{profile.role === 'professional' ? 'Profissional de Saúde' : 'Administrativo'}</p>
          </div>
          <button 
            onClick={signOut}
            className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
          >
            Sair do Sistema
          </button>
        </motion.div>
      </div>
    );
  }

  // State: Revoked
  if (profile.status === 'revoked') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-slate-100"
        >
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-8">
            <ShieldAlert size={40} />
          </div>
          <h3 className="text-2xl font-bold text-[#0f172a] mb-3">Acesso Revogado</h3>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed">
            Seu acesso a este sistema foi suspenso. Entre em contato com o administrador se considerar isso um erro.
          </p>
          <button 
            onClick={signOut}
            className="w-full bg-rose-600 text-white py-4 rounded-2xl font-bold hover:bg-rose-700 transition-all"
          >
            Sair
          </button>
        </motion.div>
      </div>
    );
  }

  return null;
}
