import React from 'react';
import { Pill, Plus, Printer, FileText, Calendar, Search, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function Prescription() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">Prescrição e Medicamentos</h1>
          <p className="text-slate-500 mt-1">Gerencie medicamentos ativos e gere novas prescrições farmacológicas.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 border border-slate-200 bg-white text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
            <Printer size={18} /> Imprimir Registro
          </button>
          <button className="px-5 py-2 bg-[#4f46e5] text-white font-semibold rounded-lg shadow-md shadow-indigo-100 hover:bg-[#4338ca] transition-all flex items-center gap-2">
            <Plus size={18} /> Criar Prescrição
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Active Medications List */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Pill size={22} className="text-[#4f46e5]" />
                <h3 className="text-lg font-bold text-[#0f172a] tracking-tight">Medicamentos Ativos</h3>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filtrar remédios..."
                  className="pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300"
                />
              </div>
            </div>
            <div className="divide-y divide-slate-100 px-8 py-2">
              {[
                { name: 'Ciprofloxacino 500mg', regimen: '1 cp a cada 12h', duration: '7 dias', started: '18/05/2024', status: 'Em Curso' },
                { name: 'Ibuprofeno 600mg', regimen: '1 cp a cada 8h se Dor', duration: 'Se necessário', started: '20/05/2024', status: 'Ativo' },
                { name: 'Clorexidina 0,12%', regimen: 'Bochecho 15ml a cada 12h', duration: '10 dias', started: '20/05/2024', status: 'Ativo' }
              ].map((med, idx) => (
                <div key={idx} className="py-6 flex items-center justify-between group hover:bg-slate-50/50 -mx-8 px-8 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black shadow-inner">
                      {med.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0f172a] group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{med.name}</h4>
                      <p className="text-sm text-slate-500 font-medium">{med.regimen}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Iniciado Em</p>
                      <p className="text-sm font-bold text-slate-600">{med.started}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${idx === 0 ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {med.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Prescription Form Preview */}
          <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-[80px]" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10 pb-10 border-b border-white/10">
                <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <FileText size={30} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Gerador de Prescrição</h3>
                  <p className="text-slate-400 text-sm font-medium">Rascunhando nova ordem farmacológica</p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-indigo-400 tracking-[0.2em] mb-3">Nome do Medicamento</label>
                    <input 
                      type="text" 
                      placeholder="ex: Paracetamol"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-indigo-400 tracking-[0.2em] mb-3">Dosagem e Via</label>
                    <input 
                      type="text" 
                      placeholder="ex: 500mg Via Oral"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-indigo-400 tracking-[0.2em] mb-3">Instruções de Uso</label>
                  <textarea 
                    placeholder="Tomar um comprimido a cada 6 horas..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-32 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Patient Alerts */}
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                <AlertCircle size={22} />
              </div>
              <h3 className="text-lg font-bold text-rose-900 tracking-tight">Contraindicações</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-rose-100/50 group">
                <span className="w-2 h-2 bg-rose-500 rounded-full mt-1.5 shrink-0 animate-pulse" />
                <div>
                  <p className="text-sm font-bold text-rose-950 uppercase tracking-tight">Interação Medicamentosa</p>
                  <p className="text-xs text-rose-700/70 font-medium">AINEs + Varfarina detectados no histórico.</p>
                </div>
              </li>
              <li className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-rose-100/50 group">
                <span className="w-2 h-2 bg-rose-500 rounded-full mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-rose-950 uppercase tracking-tight">Status de Gravidez</p>
                  <p className="text-xs text-rose-700/70 font-medium">Meds Categoria C requerem revisão especialista.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Schedule */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4f46e5]">
                <Clock size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] tracking-tight">Protocolos Padrão</h3>
            </div>
            <div className="space-y-4">
              {['Profilaxia Antibiótica (AHA)', 'Analgesia Pós-Operatória', 'Sedação de Emergência'].map((protocol, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all group">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">{protocol}</span>
                  <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-all border border-slate-100">
                    <Plus size={14} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
