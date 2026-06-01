import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Loader2, 
  Calendar, 
  Stethoscope, 
  Users, 
  Activity, 
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2,
  Filter,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService, Dentist } from '../lib/dataService';

export default function DentalReport() {
  const [loading, setLoading] = useState(true);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [allEvolutions, setAllEvolutions] = useState<any[]>([]);

  // Filters State
  const [selectedDentist, setSelectedDentist] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'current_month' | 'last_month' | 'all'>('all');
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'summary' | 'bpa_list'>('summary');

  useEffect(() => {
    async function loadReportData() {
      setLoading(true);
      try {
        const dList = await dataService.getDentists();
        setDentists(dList || []);

        const records = await dataService.getAllEvolutionsForReport();
        setAllEvolutions(records || []);
      } catch (err) {
        console.error('Error loading report data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReportData();
  }, []);

  // Filter logic
  const filteredEvolutions = allEvolutions.filter((record) => {
    // 1. Filter by Dentist
    if (selectedDentist !== 'all') {
      const matchName = record.professionalName && record.professionalName.toUpperCase() === selectedDentist.toUpperCase();
      if (!matchName) return false;
    }

    // 2. Filter by Date range
    if (selectedPeriod === 'all') return true;

    const recordDate = new Date(record._createdAt);
    const now = new Date();
    
    if (selectedPeriod === 'current_month') {
      return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
    } else if (selectedPeriod === 'last_month') {
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return recordDate.getMonth() === lastMonth && recordDate.getFullYear() === lastMonthYear;
    }

    return true;
  });

  // Calculate stats
  const totalConsultations = filteredEvolutions.length;

  // Flatten procedures to count occurrences and list
  const procedureSummaryMap = new Map<string, { code: string; name: string; count: number }>();
  const flatProceduresList: any[] = [];

  filteredEvolutions.forEach((rec) => {
    if (rec.data.procedures && Array.isArray(rec.data.procedures)) {
      rec.data.procedures.forEach((proc: any) => {
        // Individual flat record entry for BPA listing
        flatProceduresList.push({
          patientName: rec.patientName,
          patientMotherName: rec.patientMotherName || '---',
          patientCpf: rec.patientCpf,
          patientSusCard: rec.patientSusCard || '---',
          patientBirth: rec.patientBirth,
          patientPhone: rec.patientPhone || '---',
          patientFullAddress: rec.patientFullAddress || '---',
          cbo: rec.cbo || '2232-88',
          date: rec._createdAt,
          code: proc.code,
          name: proc.name,
          dentist: rec.professionalName
        });

        // Summary grouping
        const existing = procedureSummaryMap.get(proc.code);
        if (existing) {
          existing.count += 1;
        } else {
          procedureSummaryMap.set(proc.code, {
            code: proc.code,
            name: proc.name,
            count: 1
          });
        }
      });
    }
  });

  const totalProceduresPerformed = Array.from(procedureSummaryMap.values()).reduce((acc, cur) => acc + cur.count, 0);
  const avgProceduresPerConsultation = totalConsultations > 0 ? (totalProceduresPerformed / totalConsultations).toFixed(1) : '0';

  const sortedSummaryProcedures = Array.from(procedureSummaryMap.values()).sort((a, b) => b.count - a.count);

  const formatPeriodLabel = () => {
    if (selectedPeriod === 'current_month') return 'Este Mês';
    if (selectedPeriod === 'last_month') return 'Mês Anterior';
    return 'Todo o Período';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={36} />
          <p className="text-sm text-slate-500 font-bold">Compilando relatório de produção...</p>
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
      {/* Printable Area Target Identifier */}
      <div className="print:hidden flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight flex items-center gap-3">
            <FileText className="text-indigo-600" size={32} />
            Relatório de Produção SIGTAP
          </h1>
          <p className="text-slate-500 mt-1">Gere relatórios de faturamento do SUS (BPA-I) e acompanhe a produtividade clínica.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md shadow-indigo-100"
        >
          <Printer size={16} /> Imprimir Relatório
        </button>
      </div>

      {/* FILTER BOX */}
      <div className="print:hidden bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
          <Filter size={14} /> Filtros de Produção
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Cirurgião-Dentista</label>
            <select
              value={selectedDentist}
              onChange={(e) => setSelectedDentist(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none transition-all"
            >
              <option value="all">TODOS OS DENTISTAS</option>
              {dentists.map((d) => (
                <option key={d.id} value={d.name}>{d.name.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Período Fiscal</label>
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              {[
                { id: 'all', label: 'Tudo' },
                { id: 'current_month', label: 'Este Mês' },
                { id: 'last_month', label: 'Mês Ant.' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedPeriod(opt.id as any)}
                  className={`py-2 px-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-center transition-all ${
                    selectedPeriod === opt.id 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end justify-end">
            <div className="text-right text-[10px] font-bold text-slate-400">
              Registros analisados: <span className="text-slate-800 font-extrabold">{allEvolutions.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/50 p-6 rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1 relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultas Odontológicas</p>
            <p className="text-3xl font-black text-slate-900">{totalConsultations}</p>
            <p className="text-[10px] font-bold text-indigo-500">{formatPeriodLabel()}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/50 p-6 rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1 relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Procedimentos Realizados</p>
            <p className="text-3xl font-black text-slate-900">{totalProceduresPerformed}</p>
            <p className="text-[10px] font-bold text-emerald-500">Lançamentos faturáveis</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/50 p-6 rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1 relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Média por Atendimento</p>
            <p className="text-3xl font-black text-slate-900">{avgProceduresPerConsultation}</p>
            <p className="text-[10px] font-bold text-slate-400">Procedimentos / Consulta</p>
          </div>
          <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Activity size={22} />
          </div>
        </div>
      </div>

      {/* DYNAMIC REPORTS SWITCH / SECTIONS */}
      <div className="space-y-6">
        <div className="print:hidden flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
              activeTab === 'summary' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Consolidação SIGTAP
            {activeTab === 'summary' && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('bpa_list')}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
              activeTab === 'bpa_list' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Produção BPA-I (Lista Unificada)
            {activeTab === 'bpa_list' && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>
        </div>

        {/* PRINT LOGO HEADER */}
        <div className="hidden print:block border-b-2 border-indigo-600 pb-6 mb-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Unidade de Saúde Aurora Digital</h2>
              <p className="text-xs text-slate-500 font-bold">Relatório de Faturamento Individualizado - BPA-I / SISCOLO</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 font-mono">Processamento: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-indigo-600 uppercase tracking-widest font-mono">BPA-I COMPILADO</p>
              <p className="text-[11px] text-slate-500 font-bold uppercase mt-1">Filtros: {selectedDentist === 'all' ? 'TODOS OS PROFISSIONAIS' : selectedDentist.toUpperCase()}</p>
              <p className="text-[11px] text-slate-500 font-bold uppercase">Período: {formatPeriodLabel()}</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'summary' ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Tabular summary grouped by SIGTAP */}
              <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-indigo-600 tracking-wider">Tabela Consolidada de Faturamento SUS</h4>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-black tracking-widest uppercase">
                    {sortedSummaryProcedures.length} Procedimentos Distintos
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc] text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-4">Código SIGTAP</th>
                        <th className="px-8 py-4">Procedimento Realizado</th>
                        <th className="px-8 py-4 text-center">Quantidade</th>
                        <th className="px-8 py-4 text-right">Reprodutibilidade %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                      {sortedSummaryProcedures.map((proc) => {
                        const percent = totalProceduresPerformed > 0 ? ((proc.count / totalProceduresPerformed) * 100).toFixed(1) : '0';
                        return (
                          <tr key={proc.code} className="hover:bg-slate-50 transition-colors">
                            <td className="px-8 py-4 font-mono font-black text-indigo-600">{proc.code}</td>
                            <td className="px-8 py-4 font-bold text-slate-800 uppercase tracking-tight">{proc.name}</td>
                            <td className="px-8 py-4 text-center font-extrabold text-slate-950 text-sm">{proc.count}</td>
                            <td className="px-8 py-4 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <span className="font-bold text-slate-500 font-mono text-[11px]">{percent}%</span>
                                <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0 print:hidden">
                                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {sortedSummaryProcedures.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-8 py-16 text-center">
                            <Stethoscope className="mx-auto text-slate-200 mb-3" size={44} />
                            <p className="text-slate-400 font-bold">Nenhum procedimento registrado com esses filtros.</p>
                            <p className="text-slate-500 text-[11px] mt-1">Evolua o prontuário de algum paciente associando um código SIGTAP para alimentar o relatório.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="bpa_list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* BPA list detailing per-patient entry */}
              <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase text-indigo-600 tracking-wider">Lançamentos de Produção Individualizados</h4>
                    <p className="text-[11px] text-slate-400 font-bold mt-1">Utilize esta folha para preenchimento de faturas de BPA no portal oficial do Ministério da Saúde.</p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-black tracking-widest uppercase">
                    {flatProceduresList.length} Lançamentos BPA-I
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc] text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Faturamento / Cuidado</th>
                        <th className="px-6 py-4">Paciente / Nome da Mãe</th>
                        <th className="px-6 py-4">Documentação SUS</th>
                        <th className="px-6 py-4">Contato / Contrato</th>
                        <th className="px-6 py-4">Procedimento SIGTAP</th>
                        <th className="px-6 py-4">Cirurgião Credenciado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                      {flatProceduresList.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-mono">
                            <span className="block font-extrabold text-slate-900">
                              {new Date(item.date).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                              DIA DO ATENDIMENTO
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="block font-black text-slate-800 uppercase tracking-tight text-xs">
                              {item.patientName}
                            </span>
                            <span className="block text-[10px] text-indigo-600 font-bold mt-1 uppercase" title="NOME COMPLETO DA MÃE">
                              MÃE: {item.patientMotherName}
                            </span>
                          </td>
                          <td className="px-6 py-4 space-y-1">
                            <span className="block font-mono font-bold text-slate-600 text-[11px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded w-fit">
                              CPF: {item.patientCpf || '---'}
                            </span>
                            <span className="block font-mono font-bold text-emerald-700 text-[11px] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded w-fit">
                              CNS: {item.patientSusCard || '---'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-slate-700 font-bold">
                              NASC: <span className="font-mono text-slate-900">{item.patientBirth}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-semibold mt-1">
                              TEL: <span className="font-mono text-slate-800">{item.patientPhone || '---'}</span>
                            </div>
                            <div className="text-[9px] text-slate-400 truncate max-w-[150px] font-bold uppercase mt-0.5" title={item.patientFullAddress}>
                              {item.patientFullAddress}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-mono text-[10px] bg-indigo-50 border border-indigo-100 font-black text-indigo-700 px-2 py-0.5 rounded w-fit">
                                {item.code}
                              </span>
                              <span className="text-slate-800 font-extrabold text-[10px] uppercase truncate max-w-[150px]" title={item.name}>
                                {item.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-black text-slate-900 uppercase tracking-tight text-[10px]">
                              {item.dentist}
                            </div>
                            <div className="text-[10px] text-slate-400 font-extrabold mt-1">
                              CBO: <span className="text-indigo-600 font-mono font-black">{item.cbo}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {flatProceduresList.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-8 py-16 text-center">
                            <Users className="mx-auto text-slate-200 mb-3" size={44} />
                            <p className="text-slate-400 font-bold">Nenhum faturamento registrado com esses filtros.</p>
                            <p className="text-slate-500 text-[11px] mt-1">Os lançamentos individualizados BPA-I aparecerão detalhados aqui.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRINT SPECIFIC TERMS FOOTER */}
        <div className="hidden print:block mt-12 pt-8 border-t border-dashed border-slate-300">
          <div className="grid grid-cols-2 gap-12 text-center text-xs">
            <div className="space-y-1">
              <div className="h-10 border-b border-slate-300 w-4/5 mx-auto" />
              <p className="font-bold text-slate-600 uppercase">Assinatura do Profissional Responsável</p>
              <p className="text-[10px] text-slate-400 font-mono">Cirurgião-Dentista Solicitante / Credenciado</p>
            </div>
            <div className="space-y-1">
              <div className="h-10 border-b border-slate-300 w-4/5 mx-auto" />
              <p className="font-bold text-slate-600 uppercase">Diretor Clínico / Administração</p>
              <p className="text-[10px] text-slate-400 font-mono">Autorização de Processamento SUS</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
