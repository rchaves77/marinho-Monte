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
  Loader2,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Award,
  UserCheck,
  Briefcase
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
  Legend,
} from 'recharts';
import { collection, getCountFromServer, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { dataService, Patient } from '../lib/dataService';

type Period = 'diario' | 'semanal' | 'mensal' | 'semestral' | 'anual';

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('mensal');
  const [patientCount, setPatientCount] = useState<number | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [recordCounts, setRecordCounts] = useState<Record<string, number>>({});
  const [cleaning, setCleaning] = useState(false);
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(null);
  const [totalRecordsCount, setTotalRecordsCount] = useState<number | null>(null);
  const [dentistsCount, setDentistsCount] = useState<number | null>(null);
  const [medicationsCount, setMedicationsCount] = useState<number | null>(null);
  const [dynamicChartData, setDynamicChartData] = useState<{ name: string; pacientes: number }[]>([
    { name: 'Seg', pacientes: 0 },
    { name: 'Ter', pacientes: 0 },
    { name: 'Qua', pacientes: 0 },
    { name: 'Qui', pacientes: 0 },
    { name: 'Sex', pacientes: 0 },
    { name: 'Sáb', pacientes: 0 },
    { name: 'Dom', pacientes: 0 },
  ]);
  const [dynamicProcedures, setDynamicProcedures] = useState<{ code: string; name: string; count: number }[]>([]);
  const [professionalData, setProfessionalData] = useState<{ name: string; anny: number; romulo: number }[]>([]);
  const [annyTotalCount, setAnnyTotalCount] = useState<number>(0);
  const [romuloTotalCount, setRomuloTotalCount] = useState<number>(0);

  const fetchPatients = async () => {
    try {
      const results = await dataService.searchPatients({});
      // Sort patients descending by creation date safely
      const sorted = (results || []).sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });
      setPatients(sorted);

      // Lazily pull the clinical record count for each loaded patient
      const counts: Record<string, number> = {};
      let totalRecs = 0;
      for (const p of sorted) {
        if (p.id) {
          const records = await dataService.getRecordsByPatient(p.id);
          const count = records ? records.length : 0;
          counts[p.id] = count;
          totalRecs += count;
        }
      }
      setRecordCounts(counts);
      setTotalRecordsCount(totalRecs);

      // Calculate dynamic weekday counts from patient registrations
      const weekdayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
      for (const p of sorted) {
        if (p.createdAt) {
          const date = p.createdAt.toDate ? p.createdAt.toDate() : (p.createdAt.seconds ? new Date(p.createdAt.seconds * 1000) : null);
          if (date) {
            const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday ...
            weekdayCounts[dayIndex]++;
          }
        }
      }
      const formattedChart = [
        { name: 'Seg', pacientes: weekdayCounts[1] },
        { name: 'Ter', pacientes: weekdayCounts[2] },
        { name: 'Qua', pacientes: weekdayCounts[3] },
        { name: 'Qui', pacientes: weekdayCounts[4] },
        { name: 'Sex', pacientes: weekdayCounts[5] },
        { name: 'Sáb', pacientes: weekdayCounts[6] },
        { name: 'Dom', pacientes: weekdayCounts[0] }
      ];
      setDynamicChartData(formattedChart);

      // Calculate top record types dynamically
      const typeLabels: Record<string, string> = {
        'anamnese': 'Anamnese Geral',
        'clinical': 'Exame Clínico',
        'evolution': 'Evolução Clínica',
        'prescription': 'Prescrição Médica',
        'discharge': 'Alta Médica / Odonto',
        'dental_anamnese': 'Anamnese Odonto',
        'dental_odontogram': 'Odontograma / Tratamento'
      };

      const typeCounts: Record<string, number> = {};
      for (const p of sorted) {
        if (p.id) {
          const records = await dataService.getRecordsByPatient(p.id);
          if (records) {
            for (const rec of records) {
              const label = typeLabels[rec.type] || rec.type || 'Ficha';
              typeCounts[label] = (typeCounts[label] || 0) + 1;
            }
          }
        }
      }

      let sortedTypes = Object.entries(typeCounts)
        .map(([name, count]) => {
          const words = name.split(/[\s/]+/);
          const letters = words
            .filter(w => w.length > 2)
            .map(w => w.substring(0, 3).toUpperCase())
            .join('-');
          return {
            name,
            count,
            code: `REG-${letters || 'FIC'}`
          };
        })
        .sort((a,b) => b.count - a.count)
        .slice(0, 3);

      if (sortedTypes.length === 0) {
        sortedTypes = [{ name: 'Aguardando Registros', count: 0, code: '00.00.00' }];
      }
      setDynamicProcedures(sortedTypes);

      // Get dentists count
      const dentists = await dataService.getDentists() || [];
      setDentistsCount(dentists.length);

      // Get medications count
      const meds = await dataService.getMedications() || [];
      setMedicationsCount(meds.length);

      // --- CALCULATE COMPARATIVE MONTHLY PRODUCTIVITY FOR ANNY & RÔMULO ---
      const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const rollingData: { monthKey: string; name: string; anny: number; romulo: number }[] = [];
      const today = new Date();
      const anchorYear = today.getFullYear();
      const anchorMonth = today.getMonth();

      // Create a rolling 6-month array ending with the current month
      for (let i = 5; i >= 0; i--) {
        const d = new Date(anchorYear, anchorMonth - i, 1);
        rollingData.push({
          monthKey: `${d.getFullYear()}-${d.getMonth()}`,
          name: `${monthsNames[d.getMonth()]}/${d.getFullYear().toString().substring(2)}`,
          anny: 0,
          romulo: 0
        });
      }

      const belongsToProfessional = (profName: string | undefined): 'anny' | 'romulo' | null => {
        if (!profName) return null;
        const nameLower = profName.toLowerCase();
        if (nameLower.includes('anny') || nameLower.includes('ani') || nameLower.includes('ana')) {
          return 'anny';
        }
        if (nameLower.includes('rômulo') || nameLower.includes('romulo')) {
          return 'romulo';
        }
        return null;
      };

      let annySum = 0;
      let romuloSum = 0;

      for (const p of sorted) {
        if (p.id) {
          const records = await dataService.getRecordsByPatient(p.id);
          if (records) {
            for (const rec of records) {
              const prof = belongsToProfessional(rec.professionalName);
              if (prof) {
                if (prof === 'anny') annySum++;
                else if (prof === 'romulo') romuloSum++;

                if (rec.createdAt) {
                  const date = rec.createdAt.toDate ? rec.createdAt.toDate() : (rec.createdAt.seconds ? new Date(rec.createdAt.seconds * 1000) : null);
                  if (date) {
                    const rYear = date.getFullYear();
                    const rMonth = date.getMonth();
                    const key = `${rYear}-${rMonth}`;
                    const monthObj = rollingData.find(m => m.monthKey === key);
                    if (monthObj) {
                      if (prof === 'anny') {
                        monthObj.anny++;
                      } else if (prof === 'romulo') {
                        monthObj.romulo++;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      setProfessionalData(rollingData);
      setAnnyTotalCount(annySum);
      setRomuloTotalCount(romuloSum);
    } catch (err) {
      console.error('Error fetching clinical patient counts:', err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    if (!confirm(`Deseja excluir permanentemente o paciente "${patientName}" e todos os seus registros clínicos? Essa operação é irreversível.`)) {
      return;
    }
    setDeletingPatientId(patientId);
    try {
      await dataService.deletePatient(patientId);
      setPatients(prev => prev.filter(p => p.id !== patientId));
      if (patientCount !== null && patientCount > 0) {
        setPatientCount(prev => prev ? prev - 1 : 0);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir paciente do banco de dados.');
    } finally {
      setDeletingPatientId(null);
    }
  };

  const handleCleanModelData = async () => {
    if (!confirm('Deseja excluir permanentemente os dados de modelo/exemplo adicionais e deixar apenas os 3 prontuários mais recentes que você inseriu? Esta ação é irreversível.')) {
      return;
    }
    setCleaning(true);
    try {
      // 1. Sort descending based on timestamps
      const sorted = [...patients].sort((a,b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });

      // 2. Identify entries beyond the most recent 3
      const toDelete = sorted.slice(3);
      if (toDelete.length === 0) {
        alert('Seu banco de dados já possui 3 prontuários ou menos. Nenhum dado de modelo/exemplo excedente foi encontrado.');
        return;
      }

      for (const p of toDelete) {
        if (p.id) {
          await dataService.deletePatient(p.id);
        }
      }

      await fetchPatients();
      alert('Manutenção concluída! Todos os dados extras de modelo foram limpos com sucesso, mantendo intactos seus 3 prontuários.');
    } catch (err) {
      console.error(err);
      alert('Houve um erro técnico durante a limpeza dos dados.');
    } finally {
      setCleaning(false);
    }
  };

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
          <p className="text-slate-500 text-sm font-medium">Procedimentos / Evoluções</p>
          <div className="flex items-center gap-2 mt-1">
            <h3 className="text-3xl font-black text-[#0f172a]">
              {totalRecordsCount === null ? <Loader2 className="animate-spin text-slate-300" size={24} /> : totalRecordsCount}
            </h3>
            {totalRecordsCount === 0 && (
              <span className="text-[10px] text-slate-400 font-bold uppercase">(Dados Reais)</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Prontuários estruturados</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Consultas Agendadas</p>
          <div className="flex items-center gap-2 mt-1">
            <h3 className="text-3xl font-black text-[#0f172a]">0</h3>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded uppercase">Consolidado</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Nenhum agendamento pendente</p>
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
      
      {/* Recent Patients with Database Cleanup Audit Control */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0f172a] tracking-tight">Pacientes Cadastrados</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Auditoria e controle de prontuários clínicos cadastrados no Firestore.</p>
            </div>
          </div>
          <a href="/cadastro" className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-indigo-100 transition-all">+ Novo Paciente</a>
        </div>


        {/* Database notification warnings removed as requested since only real clinic records exist now */}


        <div className="hidden md:block overflow-x-auto mt-4">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
              <tr>
                <th className="px-8 py-4">Paciente</th>
                <th className="px-8 py-4">Documento</th>
                <th className="px-8 py-4">Fichas Clínicas</th>
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
                patients.map((p, index) => {
                  const getDisplayDocument = () => {
                    if (p.documentId && p.documentId.trim() !== '') {
                      return {
                        type: 'CPF',
                        value: p.documentId
                      };
                    }
                    if (p.susCard && p.susCard.trim() !== '') {
                      return {
                        type: 'CNS',
                        value: p.susCard
                      };
                    }
                    return {
                      type: 'N/A',
                      value: 'SEM DOCUMENTO'
                    };
                  };

                  const docInfo = getDisplayDocument();

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-black border border-indigo-100">
                            {(p.fullName || '??').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-[#0f172a] group-hover:text-indigo-600 transition-colors block">{p.fullName}</span>
                            <span className="inline-block mt-0.5 text-[8px] font-black text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider">Prontuário Ativo</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <span className={`font-mono text-[10px] font-black px-2.5 py-1 rounded-md w-fit uppercase ${
                            docInfo.type === 'N/A' 
                              ? 'bg-rose-50 text-rose-600 border border-rose-100/60' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {docInfo.type !== 'N/A' ? `${docInfo.type}: ` : ''}{docInfo.value}
                          </span>
                          {docInfo.type === 'CPF' && p.susCard && p.susCard.trim() !== '' && (
                            <span className="text-[9px] text-slate-400 font-bold uppercase">CNS: {p.susCard}</span>
                          )}
                          {docInfo.type === 'CNS' && p.documentId && p.documentId.trim() !== '' && (
                            <span className="text-[9px] text-slate-400 font-bold uppercase">CPF: {p.documentId}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-800 text-xs bg-slate-100 px-2.5 py-1 rounded-md">
                            {recordCounts[p.id!] !== undefined ? recordCounts[p.id!] : '...'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">registros</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-500">
                        {p.createdAt ? p.createdAt.toDate().toLocaleDateString('pt-BR') : '--'}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a 
                            href={`/prontuario/${p.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all"
                          >
                            Prontuário <ChevronRight size={14} />
                          </a>
                          <button
                            onClick={() => handleDeletePatient(p.id!, p.fullName)}
                            disabled={deletingPatientId === p.id}
                            className="p-2 text-[#94a3b8] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent cursor-pointer"
                            title="Excluir prontuário permanente"
                          >
                            {deletingPatientId === p.id ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: High density interactive list with generous tap targets */}
        <div className="block md:hidden divide-y divide-slate-100 mt-2">
          {patients.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold px-4">
              Nenhum paciente cadastrado no sistema.
            </div>
          ) : (
            patients.map((p) => {
              const getDisplayDocument = () => {
                if (p.documentId && p.documentId.trim() !== '') {
                  return { type: 'CPF', value: p.documentId };
                }
                if (p.susCard && p.susCard.trim() !== '') {
                  return { type: 'CNS', value: p.susCard };
                }
                return { type: 'N/A', value: 'SEM DOC' };
              };

              const docInfo = getDisplayDocument();
              const recCount = recordCounts[p.id!] !== undefined ? recordCounts[p.id!] : 0;

              return (
                <div key={p.id} className="p-5 space-y-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-black border border-indigo-150 uppercase shrink-0">
                        {(p.fullName || '??').substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-slate-900 text-sm block truncate leading-tight">{p.fullName}</span>
                        <span className="inline-block mt-1 text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {docInfo.type}: {docInfo.value}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-indigo-100/80 text-indigo-700 border border-indigo-150 rounded-lg px-2 py-1 font-black shrink-0">
                      {recCount} reg.
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100/80 pt-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      Cad.: {p.createdAt ? p.createdAt.toDate().toLocaleDateString('pt-BR') : '--'}
                    </span>
                    <div className="flex items-center gap-2">
                      <a 
                        href={`/prontuario/${p.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-600"
                      >
                        Prontuário <ChevronRight size={13} />
                      </a>
                      <button
                        onClick={() => handleDeletePatient(p.id!, p.fullName)}
                        disabled={deletingPatientId === p.id}
                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer bg-slate-50 border border-slate-150"
                        title="Excluir paciente"
                      >
                        {deletingPatientId === p.id ? (
                          <Loader2 className="animate-spin" size={13} />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
              <BarChart data={dynamicChartData}>
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
                  {dynamicChartData.map((entry, index) => (
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
            <h3 className="text-xl font-bold text-[#0f172a] tracking-tight">Estatísticas de Prontuários</h3>
          </div>
          
          <div className="space-y-6">
            {dynamicProcedures.map((proc, index) => (
              <div key={`${proc.code}-${index}`} className="group cursor-pointer">
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
                    animate={{ width: proc.count > 0 ? `${(proc.count / Math.max(...dynamicProcedures.map(p => p.count || 1))) * 100}%` : '0%' }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="h-full rounded-full bg-indigo-600" 
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

      {/* Comparative Productivity Section */}
      <div className="grid grid-cols-12 gap-8 mt-8">
        {/* Productivity Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-[#0f172a] tracking-tight flex items-center gap-2">
                <Award size={20} className="text-pink-600" /> Produtividade Comparativa Mensal
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">Comparativo de atendimentos realizados entre Dra. Anny e Dr. Rômulo nos últimos 6 meses.</p>
            </div>
            <span className="text-[10px] bg-slate-100 font-black text-slate-500 uppercase tracking-wider px-3 py-1 rounded-full border border-slate-200">
              Acompanhamento Ativo
            </span>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={professionalData}>
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
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <Bar 
                  dataKey="anny" 
                  name="Dra. Anny" 
                  fill="#ec4899" 
                  radius={[6, 6, 0, 0]} 
                  barSize={16}
                />
                <Bar 
                  dataKey="romulo" 
                  name="Dr. Rômulo" 
                  fill="#6366f1" 
                  radius={[6, 6, 0, 0]} 
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity Summary Side Panel */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 font-bold">
                <Briefcase size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] tracking-tight">Equipe Médica</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Metas e Rendimento</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
              O gráfico ao lado monitora a quantidade acumulada de preenchimentos de prontuários, evoluções e anamneses finalizadas por cada profissional clínico.
            </p>

            <div className="space-y-4">
              {/* Dra. Anny Card */}
              <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-black text-sm">
                    AN
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0f172a]">Dra. Anny</h4>
                    <p className="text-[9px] font-black text-pink-600 uppercase tracking-widest">Odontopediatria / Geral</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-black text-[#0f172a]">{annyTotalCount}</span>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Atendimentos</span>
                </div>
              </div>

              {/* Dr. Rômulo Card */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                    RM
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0f172a]">Dr. Rômulo</h4>
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Ortodontia / Geral</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-black text-[#0f172a]">{romuloTotalCount}</span>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Atendimentos</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="flex gap-2 items-start">
              <UserCheck size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 font-bold leading-normal">
                Insira ou associe evoluções e prontuários sob o nome de cada profissional na tela de prontuário dos pacientes para atualizar esses indicadores e alimentar a distribuição.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
