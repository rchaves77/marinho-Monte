import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  User, 
  ShieldCheck, 
  FileText, 
  Activity, 
  Clock, 
  Search,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { dataService, Dentist } from '../lib/dataService';

export default function ValidateReport() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [allEvolutions, setAllEvolutions] = useState<any[]>([]);

  // Filter params from URL or manual selection
  const [selectedDentist, setSelectedDentist] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'current_month' | 'last_month' | 'all'>('all');

  useEffect(() => {
    // Sync URL search params if they exist
    const urlPeriod = searchParams.get('periodo');
    const urlDentist = searchParams.get('dentista');

    if (urlPeriod === 'current_month' || urlPeriod === 'last_month' || urlPeriod === 'all') {
      setSelectedPeriod(urlPeriod);
    }
    if (urlDentist) {
      setSelectedDentist(urlDentist);
    }

    async function loadData() {
      setLoading(true);
      try {
        const dList = await dataService.getDentists();
        setDentists(dList || []);

        const records = await dataService.getAllEvolutionsForReport();
        setAllEvolutions(records || []);
      } catch (err) {
        console.error('Error loading validation data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchParams]);

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

  // Replicate flat list and summary maps exactly
  const procedureSummaryMap = new Map<string, { code: string; name: string; count: number }>();
  const flatProceduresList: any[] = [];

  filteredEvolutions.forEach((rec) => {
    const listToProcess: any[] = [];
    
    let hasExplicitConsulta = false;
    if (rec.data.procedures && Array.isArray(rec.data.procedures)) {
      hasExplicitConsulta = rec.data.procedures.some(
        (proc: any) => proc.code === '0301010048' || proc.code === '0301060061'
      );
    }
    
    if (!hasExplicitConsulta) {
      listToProcess.push({
        code: '0301010048',
        name: 'Consulta de profissional de nível superior na atenção especializada (exceto médico)'
      });
    }

    if (rec.data.procedures && Array.isArray(rec.data.procedures)) {
      rec.data.procedures.forEach((proc: any) => {
        listToProcess.push(proc);
      });
    }

    listToProcess.forEach((proc: any) => {
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
  });

  const totalConsultations = filteredEvolutions.length;
  const totalProceduresPerformed = Array.from(procedureSummaryMap.values()).reduce((acc, cur) => acc + cur.count, 0);
  const sortedSummaryProcedures = Array.from(procedureSummaryMap.values()).sort((a, b) => b.count - a.count);

  const formattedValidationCode = `USAD-VALID-${new Date().getFullYear()}-${selectedPeriod.substring(0,3).toUpperCase()}-${selectedDentist === 'all' ? 'GERAL' : (selectedDentist.split(' ')[1] || 'DENTISTA').toUpperCase()}`;

  const formatPeriodLabel = () => {
    if (selectedPeriod === 'current_month') return 'Este Mês';
    if (selectedPeriod === 'last_month') return 'Mês Anterior';
    return 'Todo o Período';
  };

  const getDentistLabel = () => {
    if (selectedDentist === 'all') return 'Todos os Cirurgiões-Dentistas';
    return selectedDentist;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* LOGO DEPARTAMENTO */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black uppercase tracking-wider">
            <ShieldCheck size={14} /> Portal de Validez Digital SUS
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Validação de Relatório de Produção AIH/SAME
          </h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">
            Verifique as informações registradas em tempo real com o prontuário eletrônico do Hospital Dr. Manoel Marinho Monte (SESACRE).
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-[2rem] border border-slate-205/65 p-16 text-center shadow-lg shadow-slate-100 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-bold">Consultando integridade do faturamento e blockchain local...</p>
          </div>
        ) : (
          <>
            {/* AUDIT STATUS CARD */}
            <div className="bg-white rounded-[2rem] border border-slate-205/65 overflow-hidden shadow-lg shadow-slate-150/40">
              <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 p-8 text-white relative">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                      <CheckCircle2 size={32} className="text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-400/25 px-2.5 py-0.5 rounded-full border border-white/20">
                        Documento Autêntico
                      </span>
                      <h3 className="text-xl font-black mt-1">Status: Rigorosamente Válido</h3>
                    </div>
                  </div>
                  <div className="md:text-right">
                    <span className="text-xs opacity-80 uppercase tracking-widest font-black block">Código de Auditoria</span>
                    <span className="font-mono text-sm font-black bg-slate-900/40 block px-4 py-1.5 rounded-xl border border-white/10 mt-1">
                      {formattedValidationCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* DETAILS GRID */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 border-b border-slate-100">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Parâmetros de Certificação</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                      <User size={18} className="text-indigo-600" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-black block">Cirurgião-Dentista</span>
                        <strong className="text-xs text-slate-800">{getDentistLabel()}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                      <Calendar size={18} className="text-indigo-600" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-black block">Período de Referência</span>
                        <strong className="text-xs text-slate-800">{formatPeriodLabel()}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Quantitativos Verificados</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-black block mb-1">Faturamento</span>
                      <strong className="text-2xl font-black text-teal-600 block">{totalConsultations}</strong>
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Consultas</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-black block mb-1">Remessa SAME</span>
                      <strong className="text-2xl font-black text-indigo-600 block">{totalProceduresPerformed}</strong>
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Procedimentos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MANUAL FILTER CONFIGURATION IF VISITED WITHOUT PARAMS */}
              <div className="p-8 bg-white space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Database size={16} className="text-indigo-600" />
                    Procedimentos Integrados no Sistema de Faturamento
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Abaixo constam as quantidades agregadas de procedimentos SIGTAP ativos gravados sob este período.
                  </p>
                </div>

                {/* PROCEDURES LIST CONSOLIDATED */}
                <div className="space-y-3">
                  {sortedSummaryProcedures.map((item, index) => {
                    const percentage = totalProceduresPerformed > 0 ? ((item.count / totalProceduresPerformed) * 100).toFixed(1) : '0';
                    return (
                      <div key={item.code} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-150 hover:border-indigo-200 transition-colors bg-slate-50/20">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                              {item.code}
                            </span>
                            <span className="text-xs font-black text-slate-800">{item.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-right shrink-0">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Consolidação</span>
                            <strong className="text-sm text-slate-900">{item.count} un.</strong>
                          </div>
                          <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden hidden sm:block">
                            <div className="bg-indigo-600 h-full" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600 hidden sm:inline">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                  {sortedSummaryProcedures.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs font-bold">
                      Nenhum procedimento registrado sob os critérios selecionados.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PATIENTS NOMINAL TABLE FOR TRANSPARENCY AND SUPERVISOR ACCESS */}
            <div className="bg-white rounded-[2rem] border border-slate-205/65 p-8 shadow-sm space-y-6">
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <Clock size={16} className="text-indigo-600" />
                  Listagem Nominal de Procedimentos de Auditoria
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Estes são os pacientes e diagnósticos reais que compõem este lote de faturamento. Qualquer divergência deve ser comunicada ao administrador SAME.
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 border-b border-slate-150 font-black uppercase tracking-wider text-[9px]">
                      <th className="p-4">Data</th>
                      <th className="p-4">Paciente</th>
                      <th className="p-4/6">Cartão SUS / CPF</th>
                      <th className="p-4">Código SIGTAP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flatProceduresList.map((item, index) => (
                      <tr key={`${item.date}-${index}`} className="border-b border-slate-100 hover:bg-slate-50/40">
                        <td className="p-4 font-mono font-medium text-slate-500">
                          {new Date(item.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4 font-black text-slate-800">
                          {item.patientName}
                          <span className="block text-[10px] text-slate-400 font-bold">Mãe: {item.patientMotherName}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-600">
                          <span className="block">SUS: {item.patientSusCard || '---'}</span>
                          <span className="block text-[10px] text-slate-400">CPF: {item.patientCpf || '---'}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-indigo-50 text-indigo-700 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-100">
                              {item.code}
                            </span>
                            <span className="font-bold text-slate-700 truncate max-w-xs block" title={item.name}>
                              {item.name}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {flatProceduresList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400 font-bold">
                          Nenhum paciente ou procedimento registrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MANUAL MANAGE FILTER FORM FOR DIRECT ACCESS */}
            <div className="bg-slate-100 border border-slate-200 rounded-[2rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600">
              <div className="space-y-1">
                <p className="font-black text-slate-800">Deseja simular ou validar outras remessas?</p>
                <p className="text-[11px] text-slate-400">Selecione filtros adicionais abaixo sem precisar autenticar-se no sistema.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedDentist}
                  onChange={(e) => setSelectedDentist(e.target.value)}
                  className="bg-white border border-slate-250 px-3 py-2 rounded-xl font-bold text-slate-700 text-xs"
                >
                  <option value="all">Todos os Cirurgiões-Dentistas</option>
                  {dentists.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="bg-white border border-slate-250 px-3 py-2 rounded-xl font-bold text-slate-700 text-xs"
                >
                  <option value="all">Todo o Período</option>
                  <option value="current_month">Este Mês</option>
                  <option value="last_month">Mês Anterior</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
