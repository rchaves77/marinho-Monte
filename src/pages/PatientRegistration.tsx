import React, { useState, useEffect } from 'react';
import { User, MapPin, Briefcase, Users, HeartPulse, Info, Search, Save, Check, X, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService, Patient } from '../lib/dataService';
import { useAuth } from '../lib/AuthContext';

export default function PatientRegistration() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Patient>>({
    fullName: '',
    motherName: '',
    birthDate: '',
    gender: 'Masculino',
    documentId: '',
    susCard: '',
    phone: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: 'Rio Branco',
      state: 'AC'
    },
    companionName: ''
  });

  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useState({
    documentId: '',
    name: '',
    birthDate: ''
  });
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Helper to format CPF: 000.000.000-00 (11 digits)
  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').substring(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  };

  // Helper to format CNS SUS: 000 0000 0000 0000 (15 digits)
  const formatCNS = (value: string) => {
    const digits = value.replace(/\D/g, '').substring(0, 15);
    return digits
      .replace(/(\d{3})(\d)/, '$1 $2')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .substring(0, 18);
  };

  // Helper to format Cellphone: (00) 00000-0000 or (00) 0000-0000 (10 or 11 digits)
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').substring(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 14);
    } else {
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
    }
  };

  // Helper to format Date: DD/MM/YYYY (max 8 digits)
  const formatDate = (value: string) => {
    const digits = value.replace(/\D/g, '').substring(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.substring(0, 2)}/${digits.substring(2)}`;
    return `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4)}`;
  };

  useEffect(() => {
    if (formData.birthDate && formData.birthDate.length === 10) {
      const parts = formData.birthDate.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const birthDateObj = new Date(year, month - 1, day);
          const today = new Date();
          
          let calculatedAge = today.getFullYear() - birthDateObj.getFullYear();
          const monthDiff = today.getMonth() - birthDateObj.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
            calculatedAge--;
          }
          
          setAge(calculatedAge >= 0 ? calculatedAge.toString() : '');
        }
      }
    } else {
      setAge('');
    }
  }, [formData.birthDate]);

  const handleInputChange = (field: string, value: any) => {
    let finalValue = value;

    if (field === 'documentId') {
      finalValue = formatCPF(value);
    } else if (field === 'susCard') {
      finalValue = formatCNS(value);
    } else if (field === 'phone') {
      finalValue = formatPhone(value);
    } else if (field === 'birthDate') {
      finalValue = formatDate(value);
    } else if (field === 'fullName' || field === 'motherName') {
      finalValue = value.toUpperCase();
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: finalValue
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: finalValue }));
    }
    setError(null);
  };

  const handleSearch = async () => {
    if (!searchParams.documentId && !searchParams.name && !searchParams.birthDate) {
      setError('Preencha pelo menos um campo para buscar.');
      return;
    }
    setLoading(true);
    setError(null);
    setSearchResults([]);
    try {
      const results = await dataService.searchPatients(searchParams);
      if (results && results.length > 0) {
        setSearchResults(results);
        setShowResults(true);
      } else {
        setError('Nenhum paciente encontrado com esses critérios.');
        setShowResults(false);
      }
    } catch (err) {
      setError('Erro ao realizar a busca.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectPatient = (patient: Patient) => {
    setFormData(patient);
    setShowResults(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSave = async () => {
    if (!user) {
      setError('Você precisa estar logado para salvar.');
      return;
    }

    if (!formData.fullName || !formData.motherName || !formData.birthDate || !formData.documentId) {
      setError('Por favor, preencha os campos obrigatórios (Nome, Nome da Mãe, Data de Nasc. e CPF).');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        ...formData,
        createdBy: user.uid
      };
      
      const finalId = await dataService.savePatient(payload) as string;
      
      setSuccess(true);
      // Store current patient in localStorage for the workflow
      if (finalId) {
        localStorage.setItem('currentPatientId', finalId);
      }
      
      setTimeout(() => {
        setSuccess(false);
        window.location.href = `/prontuario/${finalId}`;
      }, 1500);
    } catch (err) {
      setError('Erro ao salvar paciente.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">Cadastro do Paciente</h1>
          <p className="text-slate-500 mt-1">Busque ou cadastre novos pacientes com detalhes clínicos e administrativos.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setFormData({
              fullName: '',
              birthDate: '',
              gender: 'Masculino',
              documentId: '',
              address: { street: '', number: '', neighborhood: '', city: 'Rio Branco', state: 'AC' },
              companionName: ''
            })}
            className="px-5 py-2 border border-slate-200 bg-white text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-all shadow-sm"
          >
            Limpar
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-[#4f46e5] text-white font-semibold rounded-lg shadow-md shadow-indigo-100 hover:bg-[#4338ca] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {formData.id ? 'Atualizar Registro' : 'Salvar Registro'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-600 text-sm font-medium">
          <X size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 text-emerald-600 text-sm font-medium">
          <Check size={18} />
          Operação realizada com sucesso!
        </div>
      )}

      {/* Advanced Search Bar */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-8 relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <Search size={16} />
          </div>
          <h2 className="text-sm font-black text-[#0f172a] uppercase tracking-widest">Busca Avançada</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">CPF / CNS</label>
            <input 
              type="text" 
              placeholder="000.000.000-00"
              value={searchParams.documentId}
              onChange={(e) => setSearchParams(prev => ({ ...prev, documentId: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-medium"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nome do Paciente</label>
            <input 
              type="text" 
              placeholder="Nome parcial ou completo..."
              value={searchParams.name}
              onChange={(e) => setSearchParams(prev => ({ ...prev, name: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-medium"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Data de Nasc.</label>
            <input 
              type="date" 
              value={searchParams.birthDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, birthDate: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-medium"
            />
          </div>
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="px-8 py-2.5 bg-[#0f172a] text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 h-[42px]"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Filtrar
          </button>
        </div>

        {/* Results Overlay */}
        <AnimatePresence>
          {showResults && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resultados Encontrados ({searchResults.length})</span>
                <button onClick={() => setShowResults(false)} className="text-slate-400 hover:text-rose-500"><X size={16}/></button>
              </div>
              <div className="divide-y divide-slate-100">
                {searchResults.map((result) => (
                  <button 
                    key={result.id}
                    onClick={() => selectPatient(result)}
                    className="w-full p-4 hover:bg-indigo-50 transition-colors flex items-center justify-between text-left group"
                  >
                    <div>
                      <p className="font-bold text-[#0f172a] group-hover:text-indigo-600 transition-colors">{result.fullName}</p>
                      <p className="text-xs text-slate-500 mt-1">CPF: {result.documentId} • Nasc: {new Date(result.birthDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Nome Completo *</label>
                <input 
                  type="text" 
                  value={formData.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value.toUpperCase())}
                  placeholder="EX: JOÃO DA SILVA"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all placeholder:text-slate-300 uppercase"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Gênero</label>
                <select 
                  value={formData.gender || 'Masculino'}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all appearance-none bg-white"
                >
                  <option>Masculino</option>
                  <option>Feminino</option>
                  <option>Outro</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Nome da Mãe *</label>
                <input 
                  type="text" 
                  value={formData.motherName || ''}
                  onChange={(e) => handleInputChange('motherName', e.target.value.toUpperCase())}
                  placeholder="NOME COMPLETO DA MÃE DO PACIENTE..."
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all placeholder:text-slate-300 uppercase"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Data de Nascimento *</label>
                <input 
                  type="text" 
                  value={formData.birthDate || ''}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  placeholder="00/00/0000"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Idade</label>
                <input 
                  type="text" 
                  placeholder="--"
                  value={age ? `${age} anos` : ''}
                  readOnly
                  className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm outline-none transition-all cursor-not-allowed font-extrabold text-[#4f46e5]"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Telefone de Contato</label>
                <input 
                  type="text" 
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">CPF *</label>
                <input 
                  type="text" 
                  value={formData.documentId || ''}
                  onChange={(e) => handleInputChange('documentId', e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">CNS SUS (Cartão do SUS)</label>
                <input 
                  type="text" 
                  value={formData.susCard || ''}
                  onChange={(e) => handleInputChange('susCard', e.target.value)}
                  placeholder="000 0000 0000 0000"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all font-mono"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">URL da Foto (Opcional)</label>
                <input 
                  type="text" 
                  value={formData.photoUrl || ''}
                  onChange={(e) => handleInputChange('photoUrl', e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all placeholder:text-slate-300"
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
                  value={formData.address?.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  placeholder="Endereço principal..."
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all"
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Número</label>
                <input 
                  type="text" 
                  value={formData.address?.number}
                  onChange={(e) => handleInputChange('address.number', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all"
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bairro</label>
                <input 
                  type="text" 
                  value={formData.address?.neighborhood}
                  onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all"
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cidade / UF</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={formData.address?.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all"
                  />
                  <input 
                    type="text" 
                    value={formData.address?.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
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
                  <h4 className="text-xl font-bold tracking-tight">Dr. Manoel Marinho Monte</h4>
                </div>
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                  <HeartPulse size={24} />
                </div>
              </div>
              <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">ID do Registro</p>
                  <p className="text-lg font-mono font-bold">{formData.id ? formData.id.substring(0, 8).toUpperCase() : 'PENDENTE'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Status</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-2 h-2 ${formData.id ? 'bg-emerald-400' : 'bg-amber-400'} rounded-full animate-pulse shadow-[0_0_8px_#34d399]`} />
                    <span className="text-sm font-bold uppercase tracking-wider">{formData.id ? 'Ativo' : 'Novo'}</span>
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
                  value={formData.companionName}
                  onChange={(e) => handleInputChange('companionName', e.target.value)}
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
