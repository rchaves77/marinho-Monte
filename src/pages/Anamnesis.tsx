import React from 'react';
import { Activity, History, AlertTriangle, Stethoscope, FileEdit, Plus, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { COLORS } from '../constants';

export default function Anamnesis() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      {/* Patient Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-wrap gap-10 items-center shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#4f46e5]" />
        <div className="flex items-center gap-6 border-r border-slate-100 pr-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#4f46e5] text-2xl font-black shadow-inner">JB</div>
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">João Batista da Silva</h1>
            <p className="text-sm text-slate-400 font-medium">Registro: #8829-01 | Idade: 45 anos | Gênero: Masculino</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-lg text-[10px] font-bold border border-rose-100 shadow-sm uppercase tracking-wider">ALERGIA: PENICILINA</span>
          <span className="bg-amber-50 text-amber-700 px-4 py-1.5 rounded-lg text-[10px] font-bold border border-amber-100 shadow-sm uppercase tracking-wider">RISCO: HIPERTENSÃO</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Vital Signs */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4f46e5]">
                <Activity size={22} />
              </div>
              <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">Sinais Vitais</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Última Atualização: 10:45 AM</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                  <th className="px-4 py-3 first:rounded-l-lg">FR (irpm)</th>
                  <th className="px-4 py-3">PA (mmHg)</th>
                  <th className="px-4 py-3">SPO2 (%)</th>
                  <th className="px-4 py-3">FC (bpm)</th>
                  <th className="px-4 py-3">Temp (°C)</th>
                  <th className="px-4 py-3">Glicemia</th>
                  <th className="px-4 py-3 last:rounded-r-lg">Peso (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="font-semibold text-[#0f172a]">
                  <td className="px-4 py-6">18</td>
                  <td className="px-4 py-6"><span className="text-rose-600 font-black">150/90</span></td>
                  <td className="px-4 py-6 text-indigo-600">98</td>
                  <td className="px-4 py-6">76</td>
                  <td className="px-4 py-6">36.5</td>
                  <td className="px-4 py-6">110</td>
                  <td className="px-4 py-6">82.5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent History */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4f46e5]">
              <History size={22} />
            </div>
            <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">Histórico</h2>
          </div>
          <div className="space-y-8">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Início dos Sintomas</label>
              <input 
                type="text" 
                placeholder="Há 3 dias..."
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4f46e5] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Consulta Recente</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-3 cursor-pointer hover:bg-slate-50 transition-all has-[:checked]:border-[#4f46e5] has-[:checked]:bg-[#eef2ff] has-[:checked]:text-[#4f46e5]">
                  <input type="radio" name="recent" className="hidden" />
                  <span className="text-xs font-bold uppercase">Sim</span>
                </label>
                <label className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-3 cursor-pointer hover:bg-slate-50 transition-all has-[:checked]:border-[#4f46e5] has-[:checked]:bg-[#eef2ff] has-[:checked]:text-[#4f46e5]">
                  <input type="radio" name="recent" className="hidden" />
                  <span className="text-xs font-bold uppercase">Não</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Dental Questionnaire */}
        <div className="col-span-12 lg:col-span-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4f46e5]">
              <Stethoscope size={22} />
            </div>
            <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">Questionário de Avaliação Odontológica</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            {[
              { q: 'Apresenta sangramento gengival?', key: 'q1' },
              { q: 'Complicações anteriores com anestesia?', key: 'q2' },
              { q: 'Dificuldade com extrações passadas?', key: 'q3' },
              { q: 'Paciente está grávida?', key: 'q4' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 rounded-lg px-4 transition-all group">
                <span className="text-sm font-semibold text-[#475569] group-hover:text-[#0f172a] transition-colors">{item.q}</span>
                <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                  <button className="px-6 py-1.5 text-[10px] font-black uppercase rounded-md transition-all hover:bg-white/50 active:bg-[#4f46e5] active:text-white focus:bg-[#4f46e5] focus:text-white shadow-sm focus:shadow-indigo-200">Sim</button>
                  <button className="px-6 py-1.5 text-[10px] font-black uppercase rounded-md transition-all hover:bg-white/50 active:bg-[#4f46e5] active:text-white focus:bg-[#4f46e5] focus:text-white shadow-sm focus:shadow-indigo-200">Não</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button className="px-10 py-3 border border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-slate-100 transition-all shadow-sm">
          Resetar Formulário
        </button>
        <button className="px-10 py-3 bg-[#4f46e5] text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-[#4338ca] active:scale-95 transition-all shadow-lg shadow-indigo-200">
          Salvar Anamnese
        </button>
      </div>

      <button className="fixed bottom-10 right-10 w-16 h-16 bg-[#0f172a] text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 border border-slate-800">
        <Plus size={36} />
      </button>
    </motion.div>
  );
}
