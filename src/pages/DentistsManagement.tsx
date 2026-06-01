import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Loader2, 
  Search,
  Check,
  ShieldCheck,
  Info
} from 'lucide-react';
import { dataService, Dentist } from '../lib/dataService';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function DentistsManagement() {
  const { user, profile } = useAuth();
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    cro: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    fetchDentists(true);
  }, []);

  const fetchDentists = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await dataService.getDentists();
      setDentists(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setForm({ name: '', cro: '', status: 'active' });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (dentist: Dentist) => {
    setForm({
      name: dentist.name,
      cro: dentist.cro,
      status: dentist.status
    });
    setEditingId(dentist.id || null);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.cro) return;
    
    setSaving(true);
    try {
      await dataService.saveDentist({
        id: editingId || undefined,
        name: form.name.toUpperCase().trim(),
        cro: form.cro.toUpperCase().trim(),
        status: form.status,
        createdBy: user?.uid || 'guest-user'
      });
      setIsFormOpen(false);
      setForm({ name: '', cro: '', status: 'active' });
      setEditingId(null);
      await fetchDentists(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar cirurgião-dentista.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o cirurgião-dentista "${name}"?`)) return;
    setDeletingId(id);
    try {
      await dataService.deleteDentist(id);
      await fetchDentists(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir cirurgião-dentista.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDentists = dentists.filter(dentist => {
    const matchesSearch = dentist.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          dentist.cro.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const canManage = profile?.role === 'admin' || profile?.role === 'professional' || !!user;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={36} />
          <p className="text-sm text-slate-500 font-bold">Carregando cirurgiões-dentistas...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header and Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight flex items-center gap-3">
            <Stethoscope className="text-indigo-600" size={32} />
            Cirurgiões Dentistas
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-xs">Gerencie os dentistas credenciados e atuantes na unidade.</p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md shadow-indigo-100 shrink-0"
          >
            <Plus size={16} /> Cadastrar Dentista
          </button>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative border border-slate-100 z-10"
            >
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-[#0f172a] uppercase tracking-wide">
                        {editingId ? 'Editar Cadastro de Dentista' : 'Novo Cadastro de Dentista'}
                      </h2>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Insira os dados profissionais para credenciamento.</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Nome Completo</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      placeholder="DRA. ANNY KAROLLINY LOPES CABRAL"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Inscrição CRO (Conselho)</label>
                    <input
                      type="text"
                      value={form.cro}
                      onChange={(e) => setForm({ ...form, cro: e.target.value })}
                      required
                      placeholder="CRO/AC 1279"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Status de Atuação</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none transition-all"
                    >
                      <option value="active">Em Atividade</option>
                      <option value="inactive">Inativo / Afastado</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-indigo-100"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                    {editingId ? 'Salvar Edições' : 'Gravar Dentista'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Control Actions / Search bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou CRO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold self-end md:self-auto bg-slate-100/60 px-3 py-1.5 rounded-lg border border-slate-200/40">
          <Info size={14} className="text-slate-400" />
          Mostrando {filteredDentists.length} de {dentists.length} dentistas credenciados
        </div>
      </div>

      {/* Dentists Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredDentists.map((dentist) => (
            <motion.div
              layout
              key={dentist.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-100 p-5 rounded-3xl hover:shadow-md hover:border-indigo-100 transition-all duration-300 relative group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center rounded-2xl">
                    <Stethoscope size={24} />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    dentist.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {dentist.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-[#0f172a] group-hover:text-indigo-600 transition-colors uppercase leading-relaxed text-sm">
                    {dentist.name}
                  </h3>
                  <p className="font-mono text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                    {dentist.cro}
                  </p>
                </div>
              </div>

              {canManage && (
                <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => handleOpenEdit(dentist)}
                    className="p-2 border border-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 hover:border-indigo-100 rounded-xl transition-all"
                    title="Editar Cadastro"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(dentist.id!, dentist.name)}
                    disabled={deletingId === dentist.id}
                    className="p-2 border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 rounded-xl transition-all disabled:opacity-50"
                    title="Excluir"
                  >
                    {deletingId === dentist.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredDentists.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
          <Stethoscope className="mx-auto text-slate-200 mb-4" size={48} />
          <p className="text-slate-500 text-sm font-semibold mb-2">Nenhum cirurgião-dentista encontrado</p>
          <p className="text-slate-400 text-xs">Experimente limpar seus filtros ou cadastrar um novo profissional.</p>
        </div>
      )}
    </motion.div>
  );
}
