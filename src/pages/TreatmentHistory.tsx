import React from 'react';
import { 
  ClipboardList, 
  History, 
  Pill, 
  FileText, 
  Search, 
  Plus, 
  Printer,
  HeartPulse,
  User,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { COLORS } from '../constants';

export default function TreatmentHistory() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 pb-12"
    >
      {/* Patient Profile Header (Bento Style) */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex flex-col md:flex-row gap-10 items-center">
          <div className="relative group">
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" 
              alt="Paciente"
              className="w-28 h-28 rounded-2xl object-cover border-4 border-slate-50 group-hover:border-indigo-100 transition-all shadow-md"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white shadow-sm"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-12 w-full">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Nome Completo</p>
              <p className="text-xl font-bold text-[#0f172a] tracking-tight">Sebastião Ferreira Lima</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">ID do Registro</p>
              <p className="font-mono text-sm font-bold text-indigo-600">#449.201-B</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Idade</p>
              <p className="text-sm font-bold text-[#0f172a]">54 anos</p>
            </div>
            <div className="md:col-span-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Unidade / Leito</p>
              <p className="text-sm font-semibold text-[#475569]">204-A / Especialidade Dental</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Data de Admissão</p>
              <p className="text-sm font-bold text-[#475569]">15 de Maio, 2024</p>
            </div>
            <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl flex items-center gap-2 border border-rose-100 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider">ALERGIA: PENICILINA</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-2xl shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
          <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-widest mb-4">Status Clínico</p>
          <div className="w-20 h-20 rounded-2xl border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <HeartPulse size={40} />
          </div>
          <p className="text-sm font-black text-emerald-400 tracking-[0.2em] uppercase">Estável</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Procedures & Evolution */}
        <div className="lg:col-span-8 space-y-8">
          {/* Procedures */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center gap-3">
              <ClipboardList size={22} className="text-[#4f46e5]" />
              <h3 className="text-lg font-bold text-[#0f172a] tracking-tight">Procedimentos Executados</h3>
            </div>
            <div className="p-8">
              <div className="relative mb-8">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Filtrar procedimentos..."
                  className="w-full pl-12 pr-6 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:ring-2 focus:ring-[#4f46e5] focus:bg-white outline-none transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "01.01.02.009-0 - Selamento Provisório",
                  "03.07.02.001-0 - Acesso à Polpa Dentária",
                  "04.01.01.010-4 - Drenagem de Abscesso",
                  "04.04.02.009-7 - Excisão e Sutura"
                ].map((p, idx) => (
                  <label key={idx} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-slate-100">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded text-[#4f46e5] border-slate-300 focus:ring-[#4f46e5]" />
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0f172a] transition-colors">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Evolution Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <History size={22} className="text-[#4f46e5]" />
                <h3 className="text-lg font-bold text-[#0f172a] tracking-tight">Evolução do Tratamento</h3>
              </div>
              <button className="bg-[#4f46e5] text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#4338ca] transition-all shadow-lg shadow-indigo-100 active:scale-95">
                <Plus size={16} /> Nova Entrada
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4">Data / Hora</th>
                    <th className="px-8 py-4">Descrição</th>
                    <th className="px-8 py-4">Profissional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {[
                    { date: '20 de Maio, 2024', time: '09:15', desc: 'Raspagem supra e subgengival realizada nos sextantes 1 e 2. Profilaxia e aplicação de flúor.', dr: 'Dr. André Albuquerque', initials: 'AA' },
                    { date: '18 de Maio, 2024', time: '14:40', desc: 'Exodontia do elemento 38. Sutura simples com seda 4.0. Hemostasia satisfatória.', dr: 'Dra. Maria Clara Sales', initials: 'MC' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <span className="font-bold text-[#0f172a]">{row.date}</span>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{row.time}</div>
                      </td>
                      <td className="px-8 py-6 text-slate-600 leading-relaxed max-w-md font-medium">{row.desc}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black tracking-tighter shadow-sm ${idx === 0 ? 'bg-indigo-50 text-[#4f46e5] border border-indigo-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            {row.initials}
                          </div>
                          <span className="text-xs font-bold text-[#0f172a] whitespace-nowrap">{row.dr}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Prescription & Nursing Notes */}
        <div className="lg:col-span-4 space-y-8">
          {/* Active Prescriptions */}
          <div className="bg-[#0f172a] rounded-2xl overflow-hidden shadow-xl border border-slate-800">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3 text-white">
                <Pill size={22} className="text-indigo-400" />
                <h3 className="text-lg font-bold tracking-tight">Prescrições</h3>
              </div>
              <span className="bg-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-indigo-300 uppercase tracking-widest border border-indigo-500/30">Ciclo 24h</span>
            </div>
            <div className="divide-y divide-white/5">
              {[
                { name: 'Amoxicilina 500mg', dose: '1 cap via oral', times: ['06', '14', '22'], activeIdx: 0 },
                { name: 'Dipirona Sódica 1g', dose: 'EV (Se dor)', times: ['S/N'], activeIdx: -1 },
                { name: 'Clorexidina 0,12%', dose: 'Bochecho 15ml', times: ['12', '00'], activeIdx: 1 }
              ].map((m, idx) => (
                <div key={idx} className="p-6 hover:bg-white/5 transition-all flex justify-between items-center group cursor-pointer">
                  <div>
                    <p className="font-bold text-white group-hover:text-indigo-300 transition-colors">{m.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{m.dose}</p>
                  </div>
                  <div className="flex gap-1.5 justify-center">
                    {m.times.map((t, tIdx) => (
                      <span key={tIdx} className={`px-2.5 py-1 rounded-md text-[10px] font-black font-mono transition-all
                        ${tIdx === m.activeIdx ? 'bg-indigo-500 text-white shadow-[0_0_12px_rgba(79,70,229,0.4)]' : 'bg-slate-800 text-slate-500'}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nursing Notes */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-8 py-5 border-b border-slate-200 flex items-center gap-3">
              <FileText size={20} className="text-[#4f46e5]" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Registros de Enfermagem</h3>
            </div>
            <div className="p-8 space-y-5">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">10:30 AM</span>
                  <span className="text-[10px] font-black uppercase text-emerald-500 px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-100">Administrado</span>
                </div>
                <p className="text-xs italic text-slate-600 leading-relaxed font-medium">"Paciente calmo, sinais vitais estáveis. Higiene oral realizada conforme protocolo."</p>
                <div className="text-right mt-4 pt-4 border-t border-slate-200/50">
                  <span className="text-[10px] font-bold text-[#0f172a] uppercase tracking-tighter">— Enf. Juliana M.</span>
                </div>
              </div>
              <button className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-400 transition-all">
                + Adicionar Entrada
              </button>
            </div>
          </div>
        </div>
      </div>

      <button className="fixed bottom-10 right-10 w-16 h-16 bg-[#4f46e5] text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 border border-indigo-400 shadow-indigo-200">
        <Printer size={30} />
      </button>
    </motion.div>
  );
}

function AlertCircle(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
