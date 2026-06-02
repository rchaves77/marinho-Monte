import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ChevronRight, 
  Loader2,
  Calendar,
  UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';
import { dataService, Patient } from '../lib/dataService';
import { Link } from 'react-router-dom';

export default function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatients() {
      setLoading(true);
      try {
        // If searchTerm is short, just get recent. If long enough, use server search.
        let results;
        if (searchTerm.length >= 3) {
          // Check if it's a number (CPF) or name
          if (/^\d/.test(searchTerm)) {
             results = await dataService.searchPatients({ documentId: searchTerm });
          } else {
             results = await dataService.searchPatients({ name: searchTerm });
          }
        } else {
          results = await dataService.searchPatients({});
        }
        setPatients(results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(fetchPatients, 500); // Debounce
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Keep local filter for small adjustments/instant feedback
  const filteredPatients = patients;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">Prontuários Eletrônicos</h1>
          <p className="text-slate-500 mt-1">Acesse o histórico clínico completo de todos os pacientes cadastrados.</p>
        </div>
        <Link 
          to="/cadastro" 
          className="px-6 py-3 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <UserPlus size={16} /> Novo Cadastro
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 border border-slate-200 rounded-2xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
              <tr>
                <th className="px-8 py-4">Paciente</th>
                <th className="px-8 py-4">Documento</th>
                <th className="px-8 py-4">Nascimento</th>
                <th className="px-8 py-4">Data Cadastro</th>
                <th className="px-8 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-indigo-600 mx-auto" size={32} />
                    <p className="text-slate-400 mt-4 font-medium uppercase text-[10px] tracking-widest">Carregando pacientes...</p>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                    {searchTerm ? 'Nenhum paciente encontrado para esta busca.' : 'Nenhum paciente cadastrado.'}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-black border border-indigo-100">
                          {(p.fullName || '??').substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{p.fullName || 'Sem Nome'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{p.documentId || '--'}</span>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-600 font-medium">{p.birthDate}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={14} />
                        <span className="text-xs font-bold">{p.createdAt ? p.createdAt.toDate().toLocaleDateString('pt-BR') : '--'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link 
                        to={`/prontuario/${p.id}`}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-md hover:shadow-indigo-100"
                      >
                        Ver Prontuário <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Beautiful, easy-to-tap cards for daily hospital routines */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="animate-spin text-indigo-600 mx-auto" size={32} />
              <p className="text-slate-400 mt-3 font-medium uppercase text-[10px] tracking-widest">Carregando pacientes...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-medium italic text-xs px-4">
              {searchTerm ? 'Nenhum paciente encontrado para esta busca.' : 'Nenhum paciente cadastrado.'}
            </div>
          ) : (
            filteredPatients.map((p) => (
              <div key={p.id} className="p-5 space-y-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-black border border-indigo-150 uppercase shrink-0">
                      {(p.fullName || '??').substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-sm leading-tight truncate">{p.fullName || 'Sem Nome'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          CPF: {p.documentId || '--'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mt-1">
                    {p.birthDate}
                  </span>
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-100/70 pt-3">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                    <Calendar size={13} />
                    <span>Inscrit: {p.createdAt ? p.createdAt.toDate().toLocaleDateString('pt-BR') : '--'}</span>
                  </div>
                  <Link 
                    to={`/prontuario/${p.id}`}
                    className="inline-flex items-center gap-1.5 px-5 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-600 active:translate-y-0.5 transition-all shadow-sm"
                  >
                    Acessar Prontuário <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
