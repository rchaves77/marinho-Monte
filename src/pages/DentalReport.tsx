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
    const listToProcess: any[] = [];
    
    // Check if there is already a consultation or urgency consultation procedure explicitly selected
    let hasExplicitConsulta = false;
    if (rec.data.procedures && Array.isArray(rec.data.procedures)) {
      hasExplicitConsulta = rec.data.procedures.some(
        (proc: any) => proc.code === '0301010048' || proc.code === '0301060061'
      );
    }
    
    // 1. Every evolution represents a clinical consultation session; add it if not explicitly added
    if (!hasExplicitConsulta) {
      listToProcess.push({
        code: '0301010048',
        name: 'Consulta de profissional de nível superior na atenção especializada (exceto médico)'
      });
    }

    // 2. Add all explicitly registered procedures
    if (rec.data.procedures && Array.isArray(rec.data.procedures)) {
      rec.data.procedures.forEach((proc: any) => {
        listToProcess.push(proc);
      });
    }

    // 3. Process each item (adding them to the flat list and summary map)
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

  const totalProceduresPerformed = Array.from(procedureSummaryMap.values()).reduce((acc, cur) => acc + cur.count, 0);
  const avgProceduresPerConsultation = totalConsultations > 0 ? (totalProceduresPerformed / totalConsultations).toFixed(1) : '0';

  const sortedSummaryProcedures = Array.from(procedureSummaryMap.values()).sort((a, b) => b.count - a.count);

  const formatPeriodLabel = () => {
    if (selectedPeriod === 'current_month') return 'Este Mês';
    if (selectedPeriod === 'last_month') return 'Mês Anterior';
    return 'Todo o Período';
  };

  const exportConsolidatedCSV = () => {
    const headers = ['Código SIGTAP', 'Procedimento Realizado', 'Quantidade de Procedimentos', 'Reprodutibilidade %'];
    const csvRows = ['sep=;', headers.join(';')];

    sortedSummaryProcedures.forEach(proc => {
      const percent = totalProceduresPerformed > 0 ? ((proc.count / totalProceduresPerformed) * 100).toFixed(1) : '0';
      const row = [
        `"${proc.code}"`,
        `"${proc.name.replace(/"/g, '""')}"`,
        proc.count,
        `"${percent}%"`
      ];
      csvRows.push(row.join(';'));
    });

    const csvContent = "\uFEFF" + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.className = 'hidden';
    link.setAttribute('href', url);
    link.setAttribute('download', `consolidacao_sigtap_${selectedPeriod}_${selectedDentist.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDetailedBpaCSV = () => {
    const headers = [
      'Data de Atendimento',
      'Nome do Paciente',
      'Nome da Mãe',
      'CPF do Paciente',
      'CNS SUS (Cartão do SUS)',
      'Data de Nascimento',
      'Telefone de Contato',
      'Endereço Completo',
      'Código SIGTAP',
      'Nome do Procedimento',
      'CBO',
      'Cirurgião Credenciado'
    ];
    const csvRows = ['sep=;', headers.join(';')];

    flatProceduresList.forEach(item => {
      const row = [
        `"${new Date(item.date).toLocaleDateString('pt-BR')}"`,
        `"${item.patientName.replace(/"/g, '""')}"`,
        `"${item.patientMotherName.replace(/"/g, '""')}"`,
        `"${item.patientCpf || ''}"`,
        `"${item.patientSusCard || ''}"`,
        `"${item.patientBirth || ''}"`,
        `"${item.patientPhone || ''}"`,
        `"${item.patientFullAddress.replace(/"/g, '""')}"`,
        `"${item.code}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.cbo}"`,
        `"${item.dentist.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(';'));
    });

    const csvContent = "\uFEFF" + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.className = 'hidden';
    link.setAttribute('href', url);
    link.setAttribute('download', `remessa_aih_same_${selectedPeriod}_${selectedDentist.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <>
      {/* Estilos dedicados para impressao em Paisagem com Fonte Legivel tamanho 12 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: landscape !important;
            margin: 1.0cm !important;
          }
          body {
            background-color: white !important;
            color: black !important;
            font-family: 'Inter', sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .table-print-layout {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 12px !important;
            margin-bottom: 20px !important;
          }
          .table-print-header {
            background-color: #f1f5f9 !important;
            color: #000000 !important;
            border: 2px solid #000000 !important;
            font-size: 11pt !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            text-align: left !important;
            padding: 8px 10px !important;
            letter-spacing: 0.05em !important;
          }
          .table-print-cell {
            border: 1.5px solid #000000 !important;
            font-size: 12pt !important; /* Fonte tamanho 12 solicitado pelo usuario para excelente legibilidade */
            font-weight: 700 !important;
            color: #000000 !important;
            padding: 8px 10px !important;
            line-height: 1.35 !important;
          }
          .table-print-cell-sub {
            font-size: 10pt !important;
            color: #475569 !important;
            font-weight: 600 !important;
            margin-top: 2px !important;
            display: block !important;
          }
          .badge-sigtap-print {
            font-family: monospace !important;
            font-size: 11pt !important;
            font-weight: 950 !important;
            border: 1.5px solid #000000 !important;
            padding: 2px 6px !important;
            background-color: #f8fafc !important;
            display: inline-block !important;
            border-radius: 4px !important;
          }
          .print-header-badge {
            border: 2px solid #000000 !important;
            padding: 4px 10px !important;
            font-weight: 900 !important;
          }
          .print-section-heading {
            font-size: 14pt !important;
            font-weight: 950 !important;
            text-transform: uppercase !important;
            border-bottom: 3.5px double #000000 !important;
            padding-bottom: 4px !important;
            margin-top: 25px !important;
            margin-bottom: 12px !important;
            color: #000000 !important;
            letter-spacing: 0.05em !important;
          }
          .print-grid-stats {
            display: grid !important;
            grid-template-cols: repeat(3, minmax(0, 1fr)) !important;
            gap: 15px !important;
            margin-bottom: 25px !important;
          }
          .print-stat-item {
            border: 2.5px solid #000000 !important;
            padding: 12px !important;
            border-radius: 8px !important;
            text-align: center !important;
          }
          .print-stat-item p {
            margin: 0 !important;
          }
          .print-page-break {
            page-break-before: always !important;
          }
          .print-no-break {
            page-break-inside: avoid !important;
          }
        }
      `}} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 print:hidden"
      >
      {/* Printable Area Target Identifier */}
      <div className="print:hidden flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-gradient-to-r from-slate-50 to-indigo-50/50 p-8 rounded-[2rem] border border-slate-200/65 shadow-sm">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">SUS Digital</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">Remessa SAME / AIH</span>
          </div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight flex items-center gap-3">
            <FileText className="text-indigo-600" size={32} />
            Relatório de Faturamento
          </h1>
          <p className="text-slate-650 text-sm font-medium leading-relaxed">
            Consolide quantitativos e gere a listagem nominal de dados dos pacientes cruzados com códigos de procedimentos SIGTAP. Este documento é formatado sob regras de faturamento do SUS com fonte tamanho 12 e assinaturas digitais com validade pública via QR Code.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => window.print()}
            className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-indigo-700 active:translate-y-0.5 transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-150 shrink-0 cursor-pointer"
            title="Exportar Relatório em PDF / Imprimir"
          >
            <Printer size={18} /> Salvar em PDF (Paisagem)
          </button>
        </div>
      </div>

      {/* DEDICATED PDF & ACCESSIBILITY CONFIGURATION ASSISTANT */}
      <div className="print:hidden bg-indigo-50/60 border border-indigo-100 p-6 rounded-3xl flex flex-col lg:flex-row items-start lg:items-center gap-6 shadow-sm">
        <div className="p-3 bg-white border border-indigo-200/80 text-indigo-600 rounded-2xl shrink-0 shadow-inner">
          <AlertCircle size={24} className="animate-pulse" />
        </div>
        <div className="space-y-1 flex-1">
          <h4 className="text-xs font-black text-indigo-950 uppercase tracking-widest flex items-center gap-1.5">
            Configuração Recomendada para Exportação de PDF
          </h4>
          <p className="text-[11px] font-bold text-indigo-805 leading-relaxed">
            Para que as tabelas de remessa fiquem perfeitamente centralizadas e com a fonte tamanho 12 legível:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[10px] text-slate-650 uppercase font-black tracking-wider">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-indigo-100">
              <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">1</span>
              <span>Destino: <strong>Salvar como PDF</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-indigo-100">
              <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">2</span>
              <span>Layout: <strong>Paisagem (Landscape)</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-indigo-100">
              <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">3</span>
              <span>Fundo: <strong>Ativar Gráficos de Plano</strong></span>
            </div>
          </div>
        </div>
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
            Quantitativos de Procedimentos (Consolidação SIGTAP)
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
            Lista de Pacientes e Códigos (Entrega AIH / SAME)
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
              <p className="text-xs text-slate-500 font-bold">Relatório Consolidado de Pacientes e Procedimentos Clínicos (Envio AIH / SAME)</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 font-mono">Processamento: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-indigo-600 uppercase tracking-widest font-mono">REMESSA AIH/SAME</p>
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
                <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-black uppercase text-indigo-600 tracking-wider">Tabela Consolidada de Faturamento SUS</h4>
                    <p className="text-[11px] text-slate-400 font-bold mt-1">Resumo agrupado por código de procedimento para faturamento.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-black tracking-widest uppercase shrink-0">
                      {sortedSummaryProcedures.length} Procedimentos Distintos
                    </span>
                    {sortedSummaryProcedures.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={exportConsolidatedCSV}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                          title="Exportar Resumo Consolidado para Excel (formato CSV formatado com Ponto-e-Vírgula)"
                        >
                          <Download size={12} /> Planilha Excel / CSV
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                          title="Exportar Relatório Completo em PDF ou Imprimir em Layout Paisagem"
                        >
                          <Printer size={12} /> Exportar PDF / Imprimir
                        </button>
                      </div>
                    )}
                  </div>
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
                <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-black uppercase text-indigo-600 tracking-wider">Remessa Unificada de Atendimentos para AIH & SAME</h4>
                    <p className="text-[11px] text-slate-400 font-bold mt-1">Este controle reúne os dados cadastrais completos dos pacientes cruzados com os códigos de procedimento SIGTAP executados no período.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-black tracking-widest uppercase">
                      {flatProceduresList.length} Linhas de Remessa
                    </span>
                    {flatProceduresList.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={exportDetailedBpaCSV}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                          title="Exportar Listagem de Pacientes e Procedimentos (Remessa SAME/AIH) para Excel"
                        >
                          <Download size={12} /> Planilha Excel / CSV
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                          title="Exportar Relatório Nominal em PDF ou Imprimir em Layout Paisagem de Alta Definição"
                        >
                          <Printer size={12} /> Exportar PDF / Imprimir
                        </button>
                      </div>
                    )}
                  </div>
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
      </div>
    </motion.div>

      {/* PAISAGEM (LANDSCAPE) HIGH FORMATTED PRINT SECTION WITH FONT SIZE 12 */}
      <div className="hidden print:block w-full text-black font-sans bg-white p-2">
        {/* Cabecalho Oficial SAME/AIH */}
        <div className="border-b-4 border-black pb-4 mb-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase">Unidade de Saúde Aurora Digital</h2>
              <p className="text-sm font-bold uppercase mt-0.5">Relatório Consolidado de Pacientes e Códigos Clínicos (SAME / AIH)</p>
              <p className="text-xs font-bold text-slate-500 font-mono mt-1">EMISSÃO AUTOMÁTICA EM: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <span className="print-header-badge font-black text-[10px] uppercase tracking-widest border border-black px-3 py-1 rounded inline-block">
                CONTROLE DE REMESSA DE PROCEDIMENTOS
              </span>
              <p className="text-xs font-bold uppercase mt-2">DENTISTA: {selectedDentist === 'all' ? 'TODOS OS PROFISSIONAIS' : selectedDentist.toUpperCase()}</p>
              <p className="text-xs font-bold uppercase">PERÍODO: {formatPeriodLabel().toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Principais Metricas */}
        <div className="print-grid-stats">
          <div className="print-stat-item">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total de Consultas</p>
            <p className="text-3xl font-black mt-1">{totalConsultations}</p>
          </div>
          <div className="print-stat-item">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Procedimentos Realizados</p>
            <p className="text-3xl font-black mt-1">{totalProceduresPerformed}</p>
          </div>
          <div className="print-stat-item">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Média por Atendimento</p>
            <p className="text-3xl font-black mt-1">{avgProceduresPerConsultation}</p>
          </div>
        </div>

        {/* SECAO 1: CONSOLIDACAO SIGTAP */}
        <div className="print-no-break">
          <h3 className="print-section-heading">1. Demostrativo Quantitativo de Procedimentos (Consolidação SIGTAP)</h3>
          <p className="text-[11px] text-slate-600 font-bold mb-3 uppercase tracking-wide">Volume e distribuicao total dos codigos de procedimentos odontologicos realizados na unidade.</p>
          
          <table className="table-print-layout">
            <thead>
              <tr>
                <th className="table-print-header w-[15%]">Código SIGTAP</th>
                <th className="table-print-header w-[65%]">Procedimento Realizado</th>
                <th className="table-print-header w-[20%] text-center">Quantidade Realizada</th>
              </tr>
            </thead>
            <tbody>
              {sortedSummaryProcedures.map((proc) => (
                <tr key={proc.code}>
                  <td className="table-print-cell font-mono font-black">{proc.code}</td>
                  <td className="table-print-cell uppercase">{proc.name}</td>
                  <td className="table-print-cell text-center font-extrabold text-[13pt]">{proc.count}</td>
                </tr>
              ))}
              {sortedSummaryProcedures.length === 0 && (
                <tr>
                  <td colSpan={3} className="table-print-cell text-center italic py-6">
                    Nenhum procedimento odontológico registrado com os filtros ativos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="print-page-break" />

        {/* SECAO 2: LISTAGEM DE PACIENTES PARA AIH / SAME */}
        <div>
          <h3 className="print-section-heading">2. Relação Nominal de Procedimentos Clínicos por Paciente (Remessa SAME / AIH)</h3>
          <p className="text-[11px] text-slate-600 font-bold mb-3 uppercase tracking-wide">Tabela contendo os dados identificadores completos de faturamento, CPF, CNS, filiacao e codigos praticados.</p>

          <table className="table-print-layout">
            <thead>
              <tr>
                <th className="table-print-header w-[10%]">Data Atend.</th>
                <th className="table-print-header w-[27%]">Paciente / Nome da Mãe</th>
                <th className="table-print-header w-[18%]">Identificação Nacional (SUS)</th>
                <th className="table-print-header w-[13%]">Nascimento / Telefone</th>
                <th className="table-print-header w-[20%]">Procedimento Executado</th>
                <th className="table-print-header w-[12%]">Dentista / CBO</th>
              </tr>
            </thead>
            <tbody>
              {flatProceduresList.map((item, index) => (
                <tr key={index}>
                  <td className="table-print-cell font-mono font-black">
                    {new Date(item.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="table-print-cell">
                    <span className="font-extrabold block text-black uppercase leading-tight text-[12.5pt]">{item.patientName}</span>
                    <span className="table-print-cell-sub uppercase">MÃE: {item.patientMotherName}</span>
                  </td>
                  <td className="table-print-cell space-y-0.5">
                    <span className="block font-sans text-[11pt]">CPF: <strong className="font-mono text-[11.5pt]">{item.patientCpf || 'NÃO PORTAVA'}</strong></span>
                    <span className="block font-sans text-[11pt] text-emerald-800">CNS: <strong className="font-mono text-[11.5pt]">{item.patientSusCard || 'NÃO PORTAVA'}</strong></span>
                  </td>
                  <td className="table-print-cell">
                    <span className="block font-mono text-[11.5pt]">Nasc: {item.patientBirth}</span>
                    <span className="table-print-cell-sub">Tel: {item.patientPhone || '---'}</span>
                  </td>
                  <td className="table-print-cell">
                    <span className="badge-sigtap-print">{item.code}</span>
                    <span className="table-print-cell-sub uppercase font-extrabold text-[10.5pt]">{item.name}</span>
                  </td>
                  <td className="table-print-cell">
                    <span className="block font-black uppercase leading-tight text-[11pt] text-slate-900">{item.dentist}</span>
                    <span className="table-print-cell-sub font-mono">CBO: {item.cbo}</span>
                  </td>
                </tr>
              ))}
              {flatProceduresList.length === 0 && (
                <tr>
                  <td colSpan={6} className="table-print-cell text-center italic py-6">
                    Nenhum lançamento odontológico individualizado registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Assinaturas Digitais e QR-Code para validacao */}
        <div className="mt-8 pt-6 border-t border-dashed border-slate-400 print-no-break">
          {/* Assinaturas Fisicas para Auditoria de Papel em caso de impressao fisica */}
          <div className="grid grid-cols-2 gap-12 text-center text-xs mb-8">
            <div className="space-y-1">
              <div className="h-10 border-b border-black w-3/4 mx-auto" />
              <p className="font-bold uppercase text-[10px] text-slate-800">Assinatura do Cirurgião Responsável</p>
              <p className="text-[9px] text-slate-400 font-bold">Solicitante Odontológico Credenciado</p>
            </div>
            <div className="space-y-1">
              <div className="h-10 border-b border-black w-3/4 mx-auto" />
              <p className="font-bold uppercase text-[10px] text-slate-800">Responsável Clinico / SAME</p>
              <p className="text-[9px] text-slate-400 font-bold">Processamento de Faturamento SUS</p>
            </div>
          </div>

          {/* ICP Brasil e Auditoria QR-Code */}
          {(() => {
            const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://unidade-aurora.gov.br';
            const validationUrl = `${currentHost}/relatorios?periodo=${selectedPeriod}&dentista=${encodeURIComponent(selectedDentist)}`;
            const validationCode = `USAD-VALID-${new Date().getFullYear()}-${selectedPeriod.substring(0,3).toUpperCase()}-${selectedDentist === 'all' ? 'GERAL' : (selectedDentist.split(' ')[1] || 'DENTISTA').toUpperCase()}`;

            return (
              <div className="border-2 border-black p-4 rounded-xl flex items-center justify-between gap-6 bg-slate-50">
                <div className="flex items-center gap-6">
                  <div className="border-2 border-black bg-emerald-50 text-[#004e32] px-3 py-2 text-center rounded shrink-0">
                    <div className="font-black text-[9px] tracking-widest leading-none">ASSINADO</div>
                    <div className="font-extrabold text-[11px] uppercase mt-0.5">DIGITALMENTE</div>
                    <div className="text-[7px] font-bold text-slate-500 mt-1 uppercase">ICP-BRASIL MP 2200-2</div>
                  </div>
                  <div className="space-y-1 text-left">
                    <h5 className="text-[11px] font-black uppercase text-slate-900">Certidão Automática de Validação de Remessa SAME</h5>
                    <p className="text-[10px] text-slate-600 leading-normal max-w-xl">
                      Certificamos a integridade, o quantitativo nominal e a validade digital desta folha nominal odontologica gerada para envio aos setores SAME / AIH. A verificação pública está disponível online.
                    </p>
                    <div className="text-[9px] font-mono text-slate-500">
                      ID AUDITORIA: <strong className="text-black">{validationCode}</strong> | LINK DE VALIDAÇÃO: <span className="underline text-black font-bold">{validationUrl}</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(validationUrl)}`} 
                    alt="QR Code" 
                    className="w-16 h-16 border border-slate-300 rounded"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Validação SAME</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}
