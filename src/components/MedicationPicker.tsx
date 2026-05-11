import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  X, 
  Loader2, 
  ChevronRight,
  Database,
  Info
} from 'lucide-react';
import { dataService, Medication } from '../lib/dataService';
import { motion, AnimatePresence } from 'motion/react';

interface MedicationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (med: Medication) => void;
}

const CATEGORIES = ["Antibiótico", "Anti-inflamatório", "Corticóide", "Opioide", "Anestésico", "Outros"];

export default function MedicationPicker({ isOpen, onClose, onSelect }: MedicationPickerProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      loadMedications();
    }
  }, [isOpen]);

  const loadMedications = async () => {
    setLoading(true);
    try {
      const data = await dataService.getMedications();
      setMedications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <Pill size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Banco de Medicamentos</h3>
                  <p className="text-xs text-slate-400 font-bold">Selecione para preencher a prescrição</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-900">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Pesquisar por nome do medicamento..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {["all", ...CATEGORIES].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                      selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'Todos' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando Banco...</p>
                </div>
              ) : filteredMedications.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {filteredMedications.map(med => (
                    <button
                      key={med.id}
                      onClick={() => onSelect(med)}
                      className="group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-all" />
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          med.category === 'Antibiótico' ? 'bg-rose-100 text-rose-600' :
                          med.category === 'Anti-inflamatório' ? 'bg-amber-100 text-amber-600' :
                          'bg-indigo-100 text-indigo-600'
                        }`}>
                          <Pill size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{med.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{med.category}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-[10px] font-medium text-slate-500">{med.defaultQuantity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 md:mt-0 max-w-xs bg-white/50 p-2 rounded-xl border border-dotted border-indigo-100">
                        <p className="text-[10px] text-slate-500 leading-tight italic group-hover:text-indigo-600 transition-colors">
                           {med.defaultPosology}
                        </p>
                      </div>
                      <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all hidden md:block" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="inline-block p-6 bg-slate-50 rounded-full text-slate-200 mb-4">
                    <Database size={48} />
                  </div>
                  <h3 className="font-bold text-slate-400">Nenhum medicamento encontrado nesta categoria.</h3>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Info size={12} /> Selecione um item para preencher os campos automaticamente
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
