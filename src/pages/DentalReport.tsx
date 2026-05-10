import React from 'react';
import { FileText, Download, Share2, ClipboardCheck, Award, Mail, ExternalLink, Printer, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export default function DentalReport() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      {/* Report Header */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="bg-[#0f172a] p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-[100px]" />
          <div className="flex gap-6 items-center relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10 shadow-xl">
              <FileText size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-emerald-500/30">Oficial</span>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">ID do Relatório: #RPT-2024-811</p>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Relatório Clínico Final</h1>
            </div>
          </div>
          <div className="flex gap-3 relative z-10">
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all">
              <Share2 size={20} />
            </button>
            <button className="flex items-center gap-3 px-6 py-3 bg-[#4f46e5] text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-[#4338ca] transition-all">
              <Download size={20} /> <span className="text-sm">Baixar PDF</span>
            </button>
          </div>
        </div>

        {/* Report Summary */}
        <div className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</p>
              <p className="text-lg font-bold text-[#0f172a]">Sebastião F. Lima</p>
              <p className="text-xs text-slate-500 font-medium">Prontuário: 449.201-B</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data do Relatório</p>
              <p className="text-lg font-bold text-[#0f172a]">21 de Out, 2024</p>
              <p className="text-xs text-slate-500 font-medium">Gerado às 15:45</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Médico Assistente</p>
              <p className="text-lg font-bold text-[#0f172a]">Dr. André Albuquerque</p>
              <p className="text-xs text-slate-500 font-medium">Especialista em Cirurgia Dental</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hospital</p>
              <p className="text-lg font-bold text-[#0f172a]">Aurora Health</p>
              <p className="text-xs text-slate-500 font-medium">Depto. Maxilofacial</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 border-t border-slate-100 pt-10">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <ClipboardCheck size={20} className="text-[#4f46e5]" />
                <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">Resumo Clínico</h2>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 italic text-slate-600 text-sm leading-relaxed font-medium">
                "Paciente admitido em 15/05/2024 com diagnóstico de periodontite apical aguda. Tratamento endodôntico de emergência realizado com sucesso, seguido de exodontia do elemento necrótico. Paciente completou o ciclo de antibióticos sem reações adversas. Avaliação final mostra hemostasia completa e cicatrização inicial dentro dos parâmetros normais."
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Award size={20} className="text-[#4f46e5]" />
                <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">Autenticidade Digital</h2>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 flex flex-col justify-between h-full relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 text-indigo-200/50 group-hover:scale-110 transition-transform duration-700">
                  <ShieldAlert size={120} />
                </div>
                <div className="relative z-10">
                  <p className="text-xs text-indigo-700 font-semibold mb-4 leading-relaxed">
                    Este documento foi assinado digitalmente e criptografado. Você pode verificar sua integridade escaneando o QR único ou inserindo o hash abaixo.
                  </p>
                  <div className="p-3 bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-xl font-mono text-[10px] text-indigo-600 font-bold tracking-tighter">
                    HASH: 99a1b2-c3d4e5-f6g7h8-i9j0k1-L2M3N4
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all">
            <Mail size={16} /> Enviar via Email
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all">
            <ExternalLink size={16} /> Portal do Paciente
          </button>
        </div>
        <button className="px-10 py-3 border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-sm flex items-center gap-2" onClick={() => window.print()}>
          <Printer size={16} /> Imprimir Cópia
        </button>
      </div>
    </motion.div>
  );
}
