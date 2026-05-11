import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Activity, 
  ChevronRight, 
  Star,
  ArrowUpRight,
  ClipboardList,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
} from 'recharts';
import { collection, getCountFromServer, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { dataService, Patient } from '../lib/dataService';

const TOP_PROCEDURES = [
  { code: '03.07.02.001-0', name: 'Acesso à Polpa Dentária', count: 145, color: '#4f46e5' },
  { code: '04.01.01.010-4', name: 'Drenagem de Abscesso', count: 98, color: '#6366f1' },
  { code: '01.01.02.009-0', name: 'Selamento Provisório', count: 87, color: '#818cf8' },
];

const CHART_DATA = [
  { name: 'Seg', pacientes: 10 },
  { name: 'Ter', pacientes: 15 },
  { name: 'Qua', pacientes: 12 },
  { name: 'Qui', pacientes: 18 },
  { name: 'Sex', pacientes: 14 },
  { name: 'Sáb', pacientes: 8 },
  { name: 'Dom', pacientes: 4 },
];

type Period = 'diario' | 'semanal' | 'mensal' | 'semestral' | 'anual';

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('mensal');
  const [patientCount, setPatientCount] = useState<number | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const results = await dataService.searchPatients({});
        setPatients(results || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchPatients();
  }, []);

  useEffect(() => {
    async function fetchCount() {
      setLoading(true);
      try {
        const now = new Date();
        let startDate = new Date();

        switch (selectedPeriod) {
          case 'diario':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'semanal':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'mensal':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'semestral':
            startDate.setMonth(now.getMonth() - 6);
            break;
          case 'anual':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        const q = query(
          collection(db, 'patients'),
          where('createdAt', '>=', Timestamp.fromDate(startDate))
        );
        const snapshot = await getCountFromServer(q);
        setPatientCount(snapshot.data().count);
      } catch (error) {
        console.error('Error fetching patient count:', error);
        setPatientCount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchCount();
  }, [selectedPeriod]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">Painel de Controle</h1>
          <p className="text-slate-500 mt-1">Visão geral do desempenho clínico e estatísticas hospitalares.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto max-w-full">
          {(['diario', 'semanal', 'mensal', 'semestral', 'anual'] as Period[]).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${
                selectedPeriod === period 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            {patientCount !== null && patientCount > 0 && (
              <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                <TrendingUp size={14} className="mr-1" /> Ativo
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm font-medium">Pacientes Atendidos</p>
          <div className="flex items-center gap-2 mt-1">
            <h3 className="text-3xl font-black text-[#0f172a]">
              {loading ? <Loader2 className="animate-spin text-slate-300" size={24} /> : (patientCount ?? 0)}
            </h3>
            {patientCount === 0 && !loading && (
              <span className="text-[10px] text-slate-400 font-bold uppercase">(Dados Reais)</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Total no período {selectedPeriod}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Procedimentos Realizados</p>
          <h3 className="text-3xl font-black text-[#0f172a] mt-1">1.284</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Crescimento constante</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Consultas Agendadas</p>
          <h3 className="text-3xl font-black text-[#0f172a] mt-1">42</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Para os próximos 7 dias</p>
        </div>

        <div className="bg-[#0f172a] p-6 rounded-2xl shadow-xl shadow-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-1 relative z-10">Status do Banco</p>
          <h3 className="text-2xl font-bold text-white relative z-10">Conectado</h3>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_#34d399]" />
            <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">FireSore Ativo</span>
          </div>
        </div>
      </div>
      
      {/* Recent Patients */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users size={20} />
            </div>
            <h3 className="text-xl font-bold text-[#0f172a] tracking-tight">Pacientes Cadastrados</h3>
          </div>
          <a href="/cadastro" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">+ Novo Paciente</a>
        </div>
        <div className="overflow-x-auto">
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
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                    Nenhum paciente cadastrado no sistema.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-black">
                          {p.fullName.substring(0, 2)}
                        </div>
                        <span className="font-bold text-[#0f172a] group-hover:text-indigo-600 transition-colors">{p.fullName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-mono text-slate-500 font-bold">{p.documentId}</td>
                    <td className="px-8 py-5 text-sm text-slate-600">{p.birthDate}</td>
                    <td className="px-8 py-5 text-sm text-slate-500">
                      {p.createdAt ? p.createdAt.toDate().toLocaleDateString('pt-BR') : '--'}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <a 
                        href={`/prontuario/${p.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all"
                      >
                        Prontuário <ChevronRight size={14} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Weekly Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-[#0f172a] tracking-tight flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" /> Fluxo Semanal de Pacientes
            </h3>
            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
                <Bar 
                  dataKey="pacientes" 
                  fill="#4f46e5" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                >
                  {CHART_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#4338ca' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Procedures */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <Star size={22} />
            </div>
            <h3 className="text-xl font-bold text-[#0f172a] tracking-tight">Top 3 Procedimentos</h3>
          </div>
          
          <div className="space-y-6">
            {TOP_PROCEDURES.map((proc, index) => (
              <div key={proc.code} className="group cursor-pointer">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{proc.code}</p>
                    <h4 className="text-sm font-bold text-[#0f172a] group-hover:text-indigo-600 transition-colors uppercase">{proc.name}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-[#0f172a]">{proc.count}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Usos</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(proc.count / TOP_PROCEDURES[0].count) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="h-full rounded-full" 
                    style={{ backgroundColor: proc.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-slate-200 group-hover:rotate-12 transition-transform duration-500">
              <ClipboardList size={80} />
            </div>
            <h4 className="text-sm font-bold text-[#0f172a] mb-2 relative z-10">Relatório Completo</h4>
            <p className="text-xs text-slate-500 mb-4 relative z-10 leading-relaxed font-medium">Acesse a auditoria detalhada de todos os códigos de procedimentos.</p>
            <button className="flex items-center text-xs font-black text-indigo-600 uppercase tracking-widest gap-2 hover:gap-3 transition-all relative z-10">
              Ver todos <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
