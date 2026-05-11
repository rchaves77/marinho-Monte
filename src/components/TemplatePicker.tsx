import React, { useState, useEffect } from 'react';
import { BookMarked, Plus, Trash2, Search, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../lib/AuthContext';

interface Template {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface TemplatePickerProps {
  category: 'reason' | 'evolution' | 'prescription';
  onSelect: (content: string) => void;
  currentContent?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplatePicker({ category, onSelect, currentContent, isOpen, onClose }: TemplatePickerProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [mode, setMode] = useState<'list' | 'add'>('list');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadTemplates();
      setNewContent(currentContent || '');
      setError(null);
    }
  }, [isOpen, category, user, currentContent]);

  async function loadTemplates() {
    setLoading(true);
    setError(null);
    try {
      const results = await dataService.getTemplates(user!.uid, category);
      setTemplates(results || []);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar modelos.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTemplate() {
    if (!newTitle || !newContent || !user) return;
    setSaving(true);
    setError(null);
    try {
      await dataService.saveTemplate({
        title: newTitle,
        content: newContent,
        category,
        userId: user.uid
      });
      setNewTitle('');
      setNewContent('');
      setMode('list');
      await loadTemplates();
    } catch (err: any) {
      console.error(err);
      setError('Erro ao salvar modelo. Verifique sua conexão.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Deseja excluir este modelo?')) return;
    try {
      await dataService.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = templates.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-black uppercase text-slate-900 tracking-widest flex items-center gap-2">
              <BookMarked size={16} className="text-indigo-600" /> Modelos de {category === 'reason' ? 'Motivo' : category === 'evolution' ? 'Evolução' : 'Prescrição'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center">
              {error}
            </div>
          )}
          
          {mode === 'list' ? (
            <>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Buscar modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="py-10 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-600" size={24} />
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="text-center py-10 text-slate-400 text-sm font-medium italic">Nenhum modelo encontrado.</p>
                ) : (
                  filtered.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelect(t.content);
                        onClose();
                      }}
                      className="w-full group text-left p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{t.title}</p>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-1">{t.content}</p>
                      </div>
                      <button 
                        onClick={(e) => handleDelete(t.id, e)}
                        className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </button>
                  ))
                )}
              </div>

              {templates.length > 0 && currentContent && currentContent.length > 5 && (
                <button 
                  onClick={() => {
                    setNewContent(currentContent);
                    setMode('add');
                  }}
                  className="w-full py-4 border-2 border-dashed border-indigo-100 rounded-2xl text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all mb-4"
                >
                  <Plus size={16} /> Salvar texto atual como modelo
                </button>
              )}

              <button 
                onClick={() => {
                  setNewTitle('');
                  setNewContent('');
                  setMode('add');
                }}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Plus size={16} /> Criar novo modelo do zero
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Título do Modelo</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Ex: Anamnese Padrão Extração"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Conteúdo do Modelo</label>
                <textarea 
                  rows={6}
                  placeholder="Digite o texto que será inserido ao selecionar este modelo..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setMode('list')}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  disabled={!newTitle || !newContent || saving}
                  onClick={handleAddTemplate}
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Salvar Modelo
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
