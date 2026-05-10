import React from 'react';
import { LogOut, CheckCircle2, ShieldAlert, FileSearch, Heart, UserCheck, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export default function DischargeConditions() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight text-rose-600">Condições de Alta</h1>
          <p className="text-slate-500 mt-1">Avaliação clínica final e protocolos de autorização de alta.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-8 py-3 bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-rose-100 hover:bg-rose-700 active:scale-95 transition-all flex items-center gap-2">
            <LogOut size={16} /> Finalizar Alta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Vital Signs Checklist */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#0f172a] tracking-tight">Elegibilidade Clínica</h3>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'Sinais Vitais Estáveis (24h)', checked: true },
              { label: 'Ausência de Febre (>37.8°C)', checked: true },
              { label: 'Dor Oral Controlada', checked: true },
              { label: 'Hemostasia Assegurada', checked: false },
              { label: 'Paciente Consciente/Orientado', checked: true }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group">
                <span className="text-sm font-bold text-slate-600 group-hover:text-[#0f172a]">{item.label}</span>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${item.checked ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-200 text-slate-400'}`}>
                  {item.checked && <CheckCircle2 size={14} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discharge Instructions */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4f46e5]">
              <FileSearch size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#0f172a] tracking-tight">Instruções de Pós-Alta</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3">Restrições Alimentares</label>
              <textarea 
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                placeholder="Alimentos macios, líquidos frios por 48h..."
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3">Protocolo de Higiene Oral</label>
              <textarea 
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                placeholder="Escovação suave, bochechos salinos..."
              />
            </div>
          </div>

          <div className="bg-[#0f172a] p-8 rounded-2xl text-white mt-auto relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
            <div className="flex items-start gap-4">
              <ShieldAlert size={28} className="text-amber-500 shrink-0" />
              <div>
                <h4 className="text-lg font-bold tracking-tight mb-1">Indicadores de Retorno (Emergência)</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">Em caso de sangramento persistente, inchaço súbito, febre alta (&gt;39°C) ou dor severa que não responde à medicação, retorne imediatamente à unidade de emergência.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transportation & Companion */}
        <div className="col-span-12 lg:col-span-12 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4f46e5]">
                <UserCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] tracking-tight">Informação de Apoio</h3>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10 pl-10 border-l border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                  <Heart size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Adulto Responsável</p>
                  <p className="text-sm font-bold text-[#0f172a]">Maria Eduarda Lima (Esposa)</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Retorno para Acompanhamento</p>
                  <p className="text-sm font-bold text-[#4f46e5]">Sexta-feira, 25 de Out às 09:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
