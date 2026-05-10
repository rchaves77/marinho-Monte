import React from 'react';
import { User, MapPin, Briefcase, Users, HeartPulse, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { COLORS } from '../constants';

export default function PatientRegistration() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">Cadastro do Paciente</h1>
          <p className="text-slate-500 mt-1">Cadastre novos pacientes com detalhes clínicos e administrativos completos.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 border border-slate-200 bg-white text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-all shadow-sm">
            Cancelar
          </button>
          <button className="px-5 py-2 bg-[#4f46e5] text-white font-semibold rounded-lg shadow-md shadow-indigo-100 hover:bg-[#4338ca] transition-all">
            Salvar Registro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Personal Info */}
          <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4f46e5]">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a]">Informações Pessoais</h3>
                <p className="text-xs text-slate-400 font-medium">Dados principais de identidade</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="ex: João da Silva"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all placeholder:text-slate-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Data de Nascimento</label>
                <input 
                  type="date" 
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Idade</label>
                <input 
                  type="number" 
                  placeholder="00"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gênero</label>
                <select className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all appearance-none bg-white">
                  <option>Masculino</option>
                  <option>Feminino</option>
                  <option>Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">CPF / CNS</label>
                <input 
                  type="text" 
                  placeholder="000.000.000-00"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4f46e5]">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a]">Endereço Residencial</h3>
                <p className="text-xs text-slate-400 font-medium">Localização principal</p>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-8">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rua / Logradouro</label>
                <input 
                  type="text" 
                  placeholder="Endereço principal..."
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all"
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Número</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all"
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bairro</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all"
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cidade / UF</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    defaultValue="Rio Branco"
                    className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all"
                  />
                  <input 
                    type="text" 
                    defaultValue="AC"
                    className="w-20 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all text-center font-bold"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Status Unit */}
          <div className="bg-[#0f172a] p-8 rounded-2xl text-white relative overflow-hidden shadow-xl group border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-indigo-500/40 transition-all duration-700" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-400 mb-1">Unidade de Saúde</p>
                  <h4 className="text-xl font-bold tracking-tight">Hospital Aurora</h4>
                </div>
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                  <HeartPulse size={24} />
                </div>
              </div>
              <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">ID do Registro</p>
                  <p className="text-lg font-mono font-bold">2024-XP44</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Status</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]" />
                    <span className="text-sm font-bold uppercase tracking-wider">Ativo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Companion */}
          <section className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4f46e5]">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a]">Acompanhante</h3>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nome do Responsável</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#4f46e5] outline-none"
                />
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex gap-3">
                  <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Menores de idade e pacientes idosos devem estar acompanhados por um representante legal ou adulto responsável designado.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Visual Asset */}
          <div className="rounded-2xl overflow-hidden h-40 relative group border border-slate-200 shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600" 
              alt="Hospital"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6">
              <div className="flex items-center text-white gap-2">
                <MapPin size={14} className="text-indigo-400" />
                <span className="text-sm font-bold tracking-tight">Região Principal - Setor G</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
