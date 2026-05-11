import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Loader2, 
  Search,
  Database,
  Info
} from 'lucide-react';
import { dataService, Medication } from '../lib/dataService';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = ["Antibiótico", "Anti-inflamatório", "Corticóide", "Opioide", "Anestésico", "Outros"];

const INITIAL_MEDICATIONS: Omit<Medication, 'id' | 'createdAt' | 'createdBy'>[] = [
  // ANTIBIÓTICOS
  {
    name: "Amoxicilina 500mg",
    category: "Antibiótico",
    defaultQuantity: "21 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 8 em 8 horas por 07 dias."
  },
  {
    name: "Amoxicilina + Clavulanato de Potássio 875mg + 125mg",
    category: "Antibiótico",
    defaultQuantity: "14 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 12 em 12 horas por 07 dias."
  },
  {
    name: "Amoxicilina + Clavulanato de Potássio 500mg + 125mg",
    category: "Antibiótico",
    defaultQuantity: "21 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 8 em 8 horas por 07 dias."
  },
  {
    name: "Azitromicina 500mg",
    category: "Antibiótico",
    defaultQuantity: "03 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral uma vez ao dia por 03 dias."
  },
  {
    name: "Clindamicina 300mg",
    category: "Antibiótico",
    defaultQuantity: "21 cápsulas",
    defaultPosology: "Tomar 01 cápsula Via Oral de 8 em 8 horas por 07 dias."
  },
  {
    name: "Metronidazol 400mg",
    category: "Antibiótico",
    defaultQuantity: "21 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 8 em 8 horas por 07 dias."
  },
  {
    name: "Cefalexina 500mg",
    category: "Antibiótico",
    defaultQuantity: "28 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 6 em 6 horas por 07 dias."
  },
  {
    name: "Claritromicina 500mg",
    category: "Antibiótico",
    defaultQuantity: "14 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 12 em 12 horas por 07 dias."
  },
  {
    name: "Eritromicina 500mg",
    category: "Antibiótico",
    defaultQuantity: "28 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 6 em 6 horas por 07 dias."
  },

  // ANTI-INFLAMATÓRIOS (AINES)
  {
    name: "Nimesulida 100mg",
    category: "Anti-inflamatório",
    defaultQuantity: "06 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 12 em 12 horas por 03 dias."
  },
  {
    name: "Ibuprofeno 600mg",
    category: "Anti-inflamatório",
    defaultQuantity: "10 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 8 em 8 horas em caso de dor ou inflamação."
  },
  {
    name: "Diclofenaco Potássico 50mg",
    category: "Anti-inflamatório",
    defaultQuantity: "09 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 8 em 8 horas por 03 dias."
  },
  {
    name: "Cetoprofeno 100mg",
    category: "Anti-inflamatório",
    defaultQuantity: "06 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 12 em 12 horas por 03 dias."
  },
  {
    name: "Cetorolaco de Trometamol (Toragesic) 10mg",
    category: "Anti-inflamatório",
    defaultQuantity: "10 comprimidos (Sublingual)",
    defaultPosology: "Dissolver 01 comprimido embaixo da língua em caso de dor intensa, não exceder 04 ao dia."
  },
  {
    name: "Naproxeno 500mg",
    category: "Anti-inflamatório",
    defaultQuantity: "10 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 12 em 12 horas por 05 dias."
  },
  {
    name: "Celecoxibe 200mg",
    category: "Anti-inflamatório",
    defaultQuantity: "05 cápsulas",
    defaultPosology: "Tomar 01 cápsula Via Oral uma vez ao dia por 05 dias."
  },

  // CORTICÓIDES
  {
    name: "Dexametasona 4mg",
    category: "Corticóide",
    defaultQuantity: "01 comprimido",
    defaultPosology: "Tomar 01 comprimido Via Oral em dose única (Pré-operatório)."
  },
  {
    name: "Betametasona 2mg",
    category: "Corticóide",
    defaultQuantity: "01 comprimido",
    defaultPosology: "Tomar 01 comprimido Via Oral em dose única (Pré-operatório)."
  },
  {
    name: "Prednisona 20mg",
    category: "Corticóide",
    defaultQuantity: "05 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral uma vez ao dia por 03 a 05 dias."
  },
  {
    name: "Prednisolona 3mg/ml Solução Oral",
    category: "Corticóide",
    defaultQuantity: "01 frasco",
    defaultPosology: "Tomar ____ ml Via Oral uma vez ao dia (Dose infantil sob supervisão)."
  },

  // ANALGÉSICOS E OPIOIDES
  {
    name: "Dipirona Monoidratada 1g",
    category: "Outros",
    defaultQuantity: "10 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 6 em 6 horas em caso de dor ou febre."
  },
  {
    name: "Paracetamol 750mg",
    category: "Outros",
    defaultQuantity: "12 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 6 em 6 horas em caso de dor ou febre."
  },
  {
    name: "Codeína 30mg + Paracetamol 500mg (Tylex)",
    category: "Opioide",
    defaultQuantity: "12 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 8 em 8 horas em caso de dor intensa."
  },
  {
    name: "Tramadol 50mg",
    category: "Opioide",
    defaultQuantity: "10 cápsulas",
    defaultPosology: "Tomar 01 cápsula Via Oral de 8 em 8 horas em caso de dor intensa."
  },
  {
    name: "Tramadol 50mg + Paracetamol 325mg",
    category: "Opioide",
    defaultQuantity: "10 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 8 em 8 horas em caso de dor intensa."
  },

  // OUTROS / ANTISSÉPTICOS / ANTIFÚNGICOS
  {
    name: "Nistatina Suspensão Oral 100.000 UI",
    category: "Outros",
    defaultQuantity: "04 frascos",
    defaultPosology: "Bochechar 05ml da suspensão por 02 minutos e deglutir, 4 vezes ao dia por 14 dias."
  },
  {
    name: "Digluconato de Clorexidina 0,12%",
    category: "Outros",
    defaultQuantity: "01 frasco",
    defaultPosology: "Realizar bochechos com 15ml da solução por 01 minuto, após a higiene bucal, de 12 em 12 horas."
  },
  {
    name: "Miconazol Gel Oral 20mg/g",
    category: "Outros",
    defaultQuantity: "01 bisnaga",
    defaultPosology: "Aplicar uma pequena quantidade sobre a lesão, 4 vezes ao dia, após as refeições."
  }
];

export default function MedicationManagement() {
  const { user, profile } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [importingProgress, setImportingProgress] = useState<{current: number, total: number} | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Antibiótico' as Medication['category'],
    defaultQuantity: '',
    defaultPosology: ''
  });

  useEffect(() => {
    loadMedications();
  }, []);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await dataService.saveMedication({
        id: editingMedId || undefined,
        ...formData,
        createdBy: user.uid
      });
      setIsModalOpen(false);
      setEditingMedId(null);
      setFormData({ name: '', category: 'Antibiótico', defaultQuantity: '', defaultPosology: '' });
      loadMedications();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar medicamento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este medicamento do banco de dados?')) return;
    try {
      await dataService.deleteMedication(id);
      loadMedications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeed = async () => {
    if (!user) {
      alert('Você precisa estar logado.');
      return;
    }
    if (!confirm('Deseja importar a lista padrão de medicamentos odontológicos? Esta operação pode levar alguns segundos.')) return;
    
    setSaving(true);
    setImportingProgress({ current: 0, total: INITIAL_MEDICATIONS.length });
    
    try {
      // Reload current meds first to be sure
      const currentMeds = await dataService.getMedications();
      const currentNames = new Set(currentMeds?.map(m => m.name.toLowerCase()) || []);
      
      let added = 0;
      let skipped = 0;

      for (let i = 0; i < INITIAL_MEDICATIONS.length; i++) {
        const med = INITIAL_MEDICATIONS[i];
        setImportingProgress({ current: i + 1, total: INITIAL_MEDICATIONS.length });
        
        if (!currentNames.has(med.name.toLowerCase())) {
          await dataService.saveMedication({ ...med, createdBy: user.uid });
          added++;
        } else {
          skipped++;
        }
      }
      
      await loadMedications();
      alert(`Importação concluída!\nAdicionados: ${added}\nIgnorados (já existentes): ${skipped}`);
    } catch (err) {
      console.error(err);
      alert('Erro durante a importação. Verifique o console ou tente novamente.');
    } finally {
      setSaving(false);
      setImportingProgress(null);
    }
  };

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const canManage = profile?.role === 'admin' || profile?.role === 'professional';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Banco de Medicamentos</h1>
          <p className="text-slate-500 font-medium">Gerencie sua lista de medicamentos e posologias padrão.</p>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <>
              <button 
                onClick={handleSeed}
                disabled={saving || !!importingProgress}
                className="px-4 py-2 border border-indigo-100 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-indigo-100 transition-all disabled:opacity-50"
              >
                {importingProgress ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> {importingProgress.current}/{importingProgress.total}
                  </>
                ) : (
                  <>
                    <Database size={16} /> Importar Padrão
                  </>
                )}
              </button>
              <button 
                onClick={() => {
                  setEditingMedId(null);
                  setFormData({ name: '', category: 'Antibiótico', defaultQuantity: '', defaultPosology: '' });
                  setIsModalOpen(true);
                }}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all"
              >
                <Plus size={16} /> Novo Medicamento
              </button>
            </>
          )}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar medicamento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {["all", ...CATEGORIES].map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'Todos' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredMedications.map(med => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={med.id}
                className="group p-5 border border-slate-100 rounded-[2rem] hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all bg-white relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    med.category === 'Antibiótico' ? 'bg-rose-50 text-rose-500' :
                    med.category === 'Anti-inflamatório' ? 'bg-amber-50 text-amber-500' :
                    med.category === 'Opioide' ? 'bg-purple-50 text-purple-500' :
                    'bg-indigo-50 text-indigo-500'
                  }`}>
                    <Pill size={18} />
                  </div>
                  {canManage && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          setEditingMedId(med.id!);
                          setFormData({ name: med.name, category: med.category, defaultQuantity: med.defaultQuantity, defaultPosology: med.defaultPosology });
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Save size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(med.id!)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="font-extrabold text-slate-900 mb-1 leading-tight">{med.name}</h3>
                <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50/50 px-2 py-0.5 rounded-full tracking-wider">{med.category}</span>
                
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Database size={12} className="text-slate-300 mt-0.5" />
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      <span className="font-bold text-slate-700">Quantidade:</span> {med.defaultQuantity}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info size={12} className="text-slate-300 mt-0.5" />
                    <p className="text-[11px] text-slate-500 leading-relaxed italic">
                      {med.defaultPosology}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredMedications.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-slate-50 rounded-full text-slate-200 mb-4">
              <Pill size={48} />
            </div>
            <h3 className="font-bold text-slate-400">Nenhum medicamento encontrado.</h3>
          </div>
        )}
      </section>

      {/* Modal for Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSave} className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Plus size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">
                        {editingMedId ? 'Editar Medicamento' : 'Novo Medicamento'}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold">Configuração de posologia padrão</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nome do Medicamento</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Amoxicilina 500mg"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Categoria</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Quantidade Padrão</label>
                    <input 
                      required
                      type="text" 
                      value={formData.defaultQuantity}
                      onChange={(e) => setFormData({...formData, defaultQuantity: e.target.value})}
                      placeholder="Ex: 21 comprimidos, 01 frasco"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Posologia Padrão</label>
                    <textarea 
                      required
                      rows={4}
                      value={formData.defaultPosology}
                      onChange={(e) => setFormData({...formData, defaultPosology: e.target.value})}
                      placeholder="Ex: Tomar 01 comprimido de 8 em 8 horas..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="mt-10 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    Descartar
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar no Banco
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
