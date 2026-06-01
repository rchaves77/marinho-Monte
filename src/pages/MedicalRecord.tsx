import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  ClipboardList, 
  History, 
  Pill, 
  LogOut, 
  Loader2, 
  ChevronRight,
  Printer,
  Calendar,
  Clock,
  UserCheck,
  Save,
  Check,
  Stethoscope,
  Activity,
  HeartPulse,
  Plus,
  BookMarked,
  LayoutTemplate,
  Trash2,
  Camera,
  Database,
  Image as ImageIcon,
  Edit2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService, Patient, ClinicalRecord, Medication, Dentist } from '../lib/dataService';
import { useAuth } from '../lib/AuthContext';
import TemplatePicker from '../components/TemplatePicker';
import MedicationPicker from '../components/MedicationPicker';
import { SIGTAP_PROCEDURES, DentalProcedure } from '../constants/procedures';

type TabType = 'resumo' | 'anamnese' | 'evolucao' | 'prescricao' | 'alta';

export default function MedicalRecord() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('resumo');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingPatient, setDeletingPatient] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isMedicationPickerOpen, setIsMedicationPickerOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingRecordDate, setEditingRecordDate] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState<string>(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  });
  const [dentistsList, setDentistsList] = useState<Dentist[]>([]);
  const [selectedDentist, setSelectedDentist] = useState<string>('');
  const navigate = useNavigate();

  // Form States
  const [anamnesisForm, setAnamnesisForm] = useState({
    vitalSigns: { fr: '', pa: '', spo2: '', fc: '', tax: '', dextro: '', peso: '' },
    generalHealth: {
      foodAllergy: { value: '', detail: '' },
      controlledMedication: { value: '', detail: '' },
      recentMedication: { value: '', detail: '' },
      comorbidities: [] as string[],
      otherComorbidities: '',
      symptomsOnset: '',
      recentConsultation: { value: '', detail: '' },
    },
    dentalAnamnesis: {
      bleedingProbs: '',
      previousAnesthesia: '',
      anesthesiaSuccess: '',
      previousExtraction: '',
      extractionSuccess: '',
      pregnant: '',
    },
    systemicConditions: {
      smoke: '',
      hepatitis: '',
      fainting: '',
      anemia: '',
      alcohol: '',
      gastritis: '',
      sinusitis: '',
      others: ''
    },
    reasonForVisit: '',
    additionalNotes: ''
  });
  const [evolutionText, setEvolutionText] = useState('');
  const [selectedProcedures, setSelectedProcedures] = useState<DentalProcedure[]>([]);
  const [procedureSearchTerm, setProcedureSearchTerm] = useState('');
  const [isProcedureDropdownOpen, setIsProcedureDropdownOpen] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({ medicationName: '', dosage: '', instructions: '' });
  
  // Template States
  const [activePicker, setActivePicker] = useState<'reason'|'evolution'|'prescription'|null>(null);

  // Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Space to open templates for active tab
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        if (activeTab === 'anamnese') setActivePicker('reason');
        if (activeTab === 'evolucao') setActivePicker('evolution');
        if (activeTab === 'prescricao') setActivePicker('prescription');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);
  const [dischargeForm, setDischargeForm] = useState({
    foodRestrictions: '',
    hygieneProtocol: '',
    checklist: { vitalSigns: true, fever: true, pain: true, hemostasis: false, concious: true }
  });

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const found = await dataService.getPatientById(patientId);
      if (found) {
        setPatient(found);
        const r = await dataService.getRecordsByPatient(patientId);
        setRecords(r || []);
      }
      
      const dList = await dataService.getDentists();
      setDentistsList(dList || []);
      if (dList && dList.length > 0) {
        const uName = user?.displayName?.toUpperCase();
        const matched = dList.find(d => uName && d.name.toUpperCase().includes(uName));
        if (matched) {
          setSelectedDentist(matched.name);
        } else {
          const activeD = dList.find(d => d.status === 'active');
          setSelectedDentist(activeD ? activeD.name : dList[0].name);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar dados do prontuário. Verifique suas permissões ou conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecord = async (tabType: TabType, data: any) => {
    if (!patient || !user || !id) return;
    setSaving(true);
    
    const typeMap: Record<string, 'anamnesis' | 'evolution' | 'prescription' | 'discharge'> = {
      'anamnese': 'anamnesis',
      'evolucao': 'evolution',
      'prescricao': 'prescription',
      'alta': 'discharge'
    };

    try {
      await dataService.saveClinicalRecord({
        patientId: patient.id!,
        type: typeMap[tabType],
        data,
        createdBy: user.uid,
        professionalName: selectedDentist || user.displayName || 'Profissional',
        createdAt: new Date(attendanceDate)
      });
      setSuccess(true);
      await loadData(id); // Reload timeline
      setTimeout(() => setSuccess(false), 2000);
      
      // Reset date to current local time for next entries
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      setAttendanceDate(new Date(now.getTime() - offset).toISOString().slice(0, 16));

      // Reset forms if needed
      if (tabType === 'evolucao') {
        setEvolutionText('');
        setSelectedProcedures([]);
      }
      if (tabType === 'prescricao') setPrescriptionForm({ medicationName: '', dosage: '', instructions: '' });
      
      setActiveTab('resumo');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRecordDate = async (recordId: string) => {
    if (!patient || !id) return;
    setSaving(true);
    try {
      await dataService.updateClinicalRecord(patient.id!, recordId, {
        createdAt: new Date(editingRecordDate)
      } as any);
      setEditingRecordId(null);
      await loadData(id); // Reload timeline
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar a data do atendimento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!patient || !id || !confirm('Tem certeza que deseja excluir permanentemente este registro clínico?esta ação não pode ser desfeita.')) return;
    
    setDeletingId(recordId);
    try {
      await dataService.deleteClinicalRecord(patient.id!, recordId);
      await loadData(id); // Reload timeline
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir registro. Verifique suas permissões.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeletePatient = async () => {
    if (!patient || !confirm(`TEM CERTEZA? Isso excluirá permanentemente o paciente ${patient.fullName} e todos os seus registros.`)) return;
    
    setDeletingPatient(true);
    try {
      await dataService.deletePatient(patient.id!);
      navigate('/pacientes');
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir paciente. Verifique suas permissões.');
    } finally {
      setDeletingPatient(false);
    }
  };

  const handleUpdatePhoto = async () => {
    if (!patient || !user) return;
    setSaving(true);
    try {
      await dataService.savePatient({
        id: patient.id,
        photoUrl: newPhotoUrl,
        fullName: patient.fullName, // Required by interface technically though updateDoc only needs subset
        createdBy: patient.createdBy
      } as any);
      setPatient(prev => prev ? { ...prev, photoUrl: newPhotoUrl } : null);
      setIsEditingPhoto(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar foto.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl text-center">
        <p className="text-rose-800 font-bold text-xl">Prontuário não encontrado.</p>
        <Link to="/" className="mt-6 inline-block bg-rose-600 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest">Voltar</Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-32">
      {/* Patient Header Card */}
      <section className="bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          <div className="relative group/avatar">
            {patient.photoUrl ? (
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-xl shadow-indigo-100">
                <img src={patient.photoUrl} alt={patient.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100 border-4 border-white">
                {patient.fullName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <button 
              onClick={() => {
                setNewPhotoUrl(patient.photoUrl || '');
                setIsEditingPhoto(true);
              }}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 border border-slate-100 transition-all opacity-0 group-hover/avatar:opacity-100"
            >
              <Camera size={14} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-baseline gap-3 mb-2">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{patient.fullName}</h1>
              <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">Ativo</span>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center md:justify-start">
              <div className="flex items-center gap-2 text-slate-500">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Doc:</span>
                <span className="text-sm font-bold font-mono">{patient.documentId}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Nasc:</span>
                <span className="text-sm font-bold">{patient.birthDate}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <User size={14} className="opacity-40" />
                <span className="text-sm font-bold">{patient.companionName || 'Sem acompanhante'}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditingPhoto(true)}
              className="w-12 h-12 flex items-center justify-center border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400"
              title="Editar Fotos/Dados"
            >
              <Edit2 size={20} />
            </button>
            <button className="w-12 h-12 flex items-center justify-center border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400">
              <Printer size={20} />
            </button>
            {(profile?.role === 'admin' || user?.email === 'romulochaves77@gmail.com' && profile?.role !== 'professional') && (
              <button 
                onClick={handleDeletePatient}
                disabled={deletingPatient}
                className="w-12 h-12 flex items-center justify-center border border-rose-100 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-all text-rose-500 disabled:opacity-50"
                title="Excluir Cadastro Completo (Admin)"
              >
                {deletingPatient ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Photo Edit Modal Overlay */}
      <AnimatePresence>
        {isEditingPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingPhoto(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Camera size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Foto do Paciente</h3>
                    <p className="text-xs text-slate-400 font-bold">Insira o link da imagem</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-center mb-4">
                    {newPhotoUrl ? (
                      <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-slate-100 shadow-lg">
                        <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                        <ImageIcon size={48} />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Link da Imagem (JPG/PNG)</label>
                    <input 
                      type="text" 
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="https://exemplo.com/foto.jpg"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="mt-10 flex gap-3">
                  <button 
                    onClick={() => setIsEditingPhoto(false)}
                    className="flex-1 py-4 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleUpdatePhoto}
                    disabled={saving}
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar Foto
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-600 text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50">
        {[
          { id: 'resumo', label: 'Resumo Médico', icon: <Activity size={16} /> },
          { id: 'anamnese', label: 'Anamnese', icon: <ClipboardList size={16} /> },
          { id: 'evolucao', label: 'Evolução', icon: <History size={16} /> },
          { id: 'prescricao', label: 'Prescrição', icon: <Pill size={16} /> },
          { id: 'alta', label: 'Alta Clínica', icon: <LogOut size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all
              ${activeTab === tab.id 
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-900'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== 'resumo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Data e Hora */}
          <div className="bg-[#f8fafc] border border-slate-200/60 p-5 rounded-[1.5rem] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/40 text-indigo-600 flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Data e Hora do Atendimento</p>
                <p className="text-[11px] font-bold text-slate-500">Mude se for retroativo</p>
              </div>
            </div>
            <div>
              <input 
                type="datetime-local"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Cirurgião Dentista */}
          <div className="bg-[#f8fafc] border border-slate-200/60 p-5 rounded-[1.5rem] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/40 text-indigo-600 flex items-center justify-center">
                <Stethoscope size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Cirurgião-Dentista Responsável</p>
                <p className="text-[11px] font-bold text-slate-500">Selecione o profissional</p>
              </div>
            </div>
            <div className="flex-1 max-w-[240px]">
              <select 
                value={selectedDentist}
                onChange={(e) => setSelectedDentist(e.target.value)}
                className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {dentistsList.map(d => (
                  <option key={d.id} value={d.name}>
                    {d.name.toUpperCase()} ({d.cro})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* CONTENT: RESUMO (Timeline) */}
          {activeTab === 'resumo' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Linha do Tempo Clínica</h3>
                </div>

                {records.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <Stethoscope className="text-slate-300" size={32} />
                    </div>
                    <h4 className="text-slate-900 font-bold mb-1">Nenhum histórico registrado</h4>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">Comece realizando a anamnese ou evoluindo o estado do paciente através das abas acima.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {records.map((record) => (
                      <div key={record.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              {record.type === 'anamnesis' ? <ClipboardList size={18} /> : 
                               record.type === 'evolution' ? <History size={18} /> :
                               record.type === 'prescription' ? <Pill size={18} /> : <LogOut size={18} />}
                            </div>
                            <div>
                              {editingRecordId === record.id ? (
                                <div className="flex flex-wrap items-center gap-2 mb-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                  <input 
                                    type="datetime-local"
                                    value={editingRecordDate}
                                    onChange={(e) => setEditingRecordDate(e.target.value)}
                                    className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                  <button 
                                    onClick={() => handleUpdateRecordDate(record.id!)}
                                    disabled={saving}
                                    className="px-3 py-1.5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-wider rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-1 shadow-md shadow-indigo-100 disabled:opacity-50"
                                  >
                                    {saving ? <Loader2 size={10} className="animate-spin" /> : <Check size={12} />} Salvar
                                  </button>
                                  <button 
                                    onClick={() => setEditingRecordId(null)}
                                    className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-slate-300 transition-all"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mb-0.5 group/date">
                                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    {record.createdAt ? (
                                      record.createdAt.toDate ? (
                                        <>
                                          {record.createdAt.toDate().toLocaleDateString('pt-BR')} às {record.createdAt.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </>
                                      ) : (
                                        <>Data registrada</>
                                      )
                                    ) : (
                                      <>Recentemente salvo</>
                                    )}
                                  </p>
                                  <button 
                                    onClick={() => {
                                      setEditingRecordId(record.id!);
                                      if (record.createdAt) {
                                        const d = record.createdAt.toDate ? record.createdAt.toDate() : new Date();
                                        const offset = d.getTimezoneOffset() * 60000;
                                        setEditingRecordDate(new Date(d.getTime() - offset).toISOString().slice(0, 16));
                                      } else {
                                        const now = new Date();
                                        const offset = now.getTimezoneOffset() * 60000;
                                        setEditingRecordDate(new Date(now.getTime() - offset).toISOString().slice(0, 16));
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition-all inline-flex items-center"
                                    title="Editar Data do Atendimento"
                                  >
                                    <Edit2 size={11} />
                                  </button>
                                </div>
                              )}
                              <h4 className="font-bold text-slate-800 uppercase text-xs mb-3">{record.type.replace('anamnesis', 'Anamnese').replace('evolution', 'Evolução').replace('prescription', 'Prescrição').replace('discharge', 'Alta')}</h4>
                              
                              <div className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                                {record.type === 'evolution' && (
                                  <div className="space-y-3">
                                    <p className="text-slate-700 whitespace-pre-wrap">{record.data.text}</p>
                                    {record.data.procedures && record.data.procedures.length > 0 && (
                                      <div className="space-y-1.5 pt-1">
                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Procedimentos Realizados (SIGTAP)</p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {record.data.procedures.map((proc: any, pIdx: number) => (
                                            <span 
                                              key={pIdx} 
                                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[10px] text-indigo-700 font-bold uppercase tracking-tight"
                                              title={proc.name}
                                            >
                                              <span className="font-mono text-[9px] bg-indigo-200/50 px-1 py-0.5 rounded text-indigo-800">{proc.code}</span>
                                              <span className="truncate max-w-[280px]">{proc.name}</span>
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {record.type === 'prescription' && <span>{record.data.medicationName} - {record.data.dosage}</span>}
                                {record.type === 'anamnesis' && (
                                  <div className="space-y-1">
                                    <p>Anamnese Completa Registrada</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                      {record.data.vitalSigns && Object.entries(record.data.vitalSigns).map(([k, v]) => (
                                        v && <span key={k} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">{k.toUpperCase()}: {String(v)}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {record.type === 'discharge' && (
                                  <div className="space-y-1">
                                    <p className="font-medium text-rose-600">Alta Clínica Realizada</p>
                                    <p className="text-xs line-clamp-1">{record.data.foodRestrictions}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                             <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{record.professionalName}</div>
                             {(profile?.role === 'admin' || user?.email === 'romulochaves77@gmail.com' && profile?.role !== 'professional') && (
                               <button 
                                 onClick={() => handleDeleteRecord(record.id!)}
                                 disabled={deletingId === record.id}
                                 className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50 border border-transparent hover:border-rose-100"
                                 title="Excluir Registro (Admin)"
                               >
                                 {deletingId === record.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                               </button>
                             )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) }
              </div>

              <div className="md:col-span-4 space-y-6">
                 <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-xl" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Status da Unidade</h4>
                    <div className="flex items-center gap-5 border-b border-white/5 pb-6 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <HeartPulse size={28} />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-300/50 mb-1">Localização</p>
                            <p className="font-bold text-sm">Dr. Manoel Marinho Monte</p>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* CONTENT: ANAMNESE */}
          {activeTab === 'anamnese' && (
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 space-y-12">
              {/* Vital Signs */}
              <div>
                <h4 className="text-sm font-black uppercase text-indigo-600 tracking-widest mb-6 flex items-center gap-2">
                  <Activity size={16} /> Sinais Vitais
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {[
                    { id: 'fr', label: 'FR (Rpm)' },
                    { id: 'pa', label: 'PA (mmHg)' },
                    { id: 'spo2', label: 'SPO2 (%)' },
                    { id: 'fc', label: 'FC (Bpm)' },
                    { id: 'tax', label: 'Tax (°C)' },
                    { id: 'dextro', label: 'Dextro (mg/dL)' },
                    { id: 'peso', label: 'Peso (kg)' }
                  ].map((field) => (
                    <div key={field.id}>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{field.label}</label>
                      <input 
                        type="text" 
                        placeholder="--"
                        value={(anamnesisForm.vitalSigns as any)[field.id]}
                        onChange={(e) => setAnamnesisForm(prev => ({ ...prev, vitalSigns: { ...prev.vitalSigns, [field.id]: e.target.value } }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* General Health Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <h4 className="text-sm font-black uppercase text-indigo-600 tracking-widest mb-6 flex items-center gap-2">
                    <Stethoscope size={16} /> Saúde Geral
                  </h4>
                  
                  {/* Allergies and Meds with details */}
                  {[
                    { id: 'foodAllergy', label: 'Alergia alimentar?', path: 'generalHealth' },
                    { id: 'controlledMedication', label: 'Medicamento controlado?', path: 'generalHealth' },
                    { id: 'recentMedication', label: 'Fez uso de alguma medicação recente?', path: 'generalHealth' },
                    { id: 'recentConsultation', label: 'Consulta / Internação recentes?', path: 'generalHealth' }
                  ].map((field) => (
                    <div key={field.id} className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 block">{field.label}</label>
                      <div className="flex gap-4 items-center">
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                          {['Sim', 'Não'].map(opt => (
                            <button
                              key={opt}
                              onClick={() => setAnamnesisForm(prev => ({
                                ...prev,
                                generalHealth: {
                                  ...prev.generalHealth,
                                  [field.id]: { ...((prev.generalHealth as any)[field.id]), value: opt }
                                }
                              }))}
                              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                                ${(anamnesisForm.generalHealth as any)[field.id].value === opt ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        {(anamnesisForm.generalHealth as any)[field.id].value === 'Sim' && (
                          <input 
                            type="text"
                            placeholder="Qual?"
                            value={(anamnesisForm.generalHealth as any)[field.id].detail}
                            onChange={(e) => setAnamnesisForm(prev => ({
                              ...prev,
                              generalHealth: {
                                ...prev.generalHealth,
                                [field.id]: { ...((prev.generalHealth as any)[field.id]), detail: e.target.value }
                              }
                            }))}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 block">Comorbidades</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['HAS', 'Diabetes', 'ICC', 'Insuficiência Renal', 'DPOC', 'Sequela AVC'].map(item => (
                        <button
                          key={item}
                          onClick={() => {
                            const current = anamnesisForm.generalHealth.comorbidities;
                            const next = current.includes(item) ? current.filter(c => c !== item) : [...current, item];
                            setAnamnesisForm(prev => ({ ...prev, generalHealth: { ...prev.generalHealth, comorbidities: next } }));
                          }}
                          className={`px-4 py-3 rounded-xl text-[10px] font-bold text-left border transition-all
                            ${anamnesisForm.generalHealth.comorbidities.includes(item) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <input 
                      type="text"
                      placeholder="Outras comorbidades..."
                      value={anamnesisForm.generalHealth.otherComorbidities}
                      onChange={(e) => setAnamnesisForm(prev => ({ ...prev, generalHealth: { ...prev.generalHealth, otherComorbidities: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="text-sm font-black uppercase text-indigo-600 tracking-widest mb-6 flex items-center gap-2">
                    <History size={16} /> Anamnese Odontológica
                  </h4>

                  {[
                    { id: 'bleedingProbs', label: 'Problema com sangramento/cicatrização?' },
                    { id: 'previousAnesthesia', label: 'Já foi anestesiado para tratamento odontológico?' },
                    { id: 'anesthesiaSuccess', label: 'Ocorreu tudo bem na anestesia?', condition: 'previousAnesthesia' },
                    { id: 'previousExtraction', label: 'Já fez alguma extração dentária?' },
                    { id: 'extractionSuccess', label: 'Ocorreu tudo bem na extração?', condition: 'previousExtraction' },
                    { id: 'pregnant', label: 'Está grávida no momento? (Se aplicável)' }
                  ].map((field) => (
                    (!field.condition || (anamnesisForm.dentalAnamnesis as any)[field.condition] === 'Sim') && (
                      <div key={field.id} className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 block">{field.label}</label>
                        <div className="flex gap-2">
                          {['Sim', 'Não', 'Não sei'].map(opt => (
                            <button
                              key={opt}
                              onClick={() => setAnamnesisForm(prev => ({
                                ...prev,
                                dentalAnamnesis: { ...prev.dentalAnamnesis, [field.id]: opt }
                              }))}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                                ${(anamnesisForm.dentalAnamnesis as any)[field.id] === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-200'}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  ))}

                  <div className="pt-4">
                     <label className="text-sm font-bold text-slate-700 block mb-3">Condições Sistêmicas</label>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {['Fuma', 'Hepatite', 'Desmaios', 'Anemia', 'Álcool', 'Gastrite', 'Sinusite'].map(cond => (
                          <button
                            key={cond}
                            onClick={() => setAnamnesisForm(prev => ({
                              ...prev,
                              systemicConditions: { 
                                ...prev.systemicConditions, 
                                [cond.toLowerCase()]: (prev.systemicConditions as any)[cond.toLowerCase()] === 'Sim' ? 'Não' : 'Sim' 
                              }
                            }))}
                            className={`px-3 py-2.5 rounded-xl text-[10px] font-bold text-center border transition-all
                              ${(anamnesisForm.systemicConditions as any)[cond.toLowerCase()] === 'Sim' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                          >
                            {cond}
                          </button>
                        ))}
                     </div>
                  </div>
                </div>
              </div>

              {/* Reason and Notes */}
              <div className="space-y-6 pt-8 border-t border-slate-100">
                <div>
                   <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-bold text-slate-700 block">Qual o motivo de você ter procurado atendimento odontológico?</label>
                      <div className="flex items-center gap-2">
                        <span className="hidden md:inline text-[9px] text-slate-400 font-medium">Atalho: Ctrl + Espaço</span>
                        <button 
                          onClick={() => setActivePicker('reason')}
                          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100/50"
                        >
                          <BookMarked size={12} /> Modelos (Ctrl+Espaço)
                        </button>
                        {anamnesisForm.reasonForVisit && anamnesisForm.reasonForVisit.length > 5 && (
                          <button 
                            onClick={() => setActivePicker('reason')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200/50"
                          >
                            <Plus size={12} /> Salvar como Modelo
                          </button>
                        )}
                      </div>
                   </div>
                   <textarea 
                     rows={3}
                     value={anamnesisForm.reasonForVisit}
                     onChange={(e) => setAnamnesisForm(prev => ({ ...prev, reasonForVisit: e.target.value }))}
                     className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                   />
                </div>
                <div>
                   <label className="text-sm font-bold text-slate-700 block mb-3">Gostaria de acrescentar algo mais?</label>
                   <textarea 
                     rows={2}
                     value={anamnesisForm.additionalNotes}
                     onChange={(e) => setAnamnesisForm(prev => ({ ...prev, additionalNotes: e.target.value }))}
                     className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                   />
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <button 
                  onClick={() => handleSaveRecord('anamnese', anamnesisForm)} 
                  disabled={saving} 
                  className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl shadow-indigo-200 flex items-center gap-4 hover:bg-indigo-700 active:scale-95 transition-all"
                >
                   {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Finalizar e Salvar Anamnese
                </button>
              </div>
            </div>
          )}

          {/* CONTENT: EVOLUÇÃO */}
          {activeTab === 'evolucao' && (
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
                  <History size={16} /> Evolução Clínica
                </h4>
                <div className="flex items-center gap-2">
                  <span className="hidden md:inline text-[9px] text-slate-400 font-medium">Atalho: Ctrl + Espaço</span>
                  <button 
                    onClick={() => setActivePicker('evolution')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100/50"
                  >
                    <LayoutTemplate size={14} /> Usar Modelo (Ctrl+Espaço)
                  </button>
                  {evolutionText && evolutionText.length > 5 && (
                    <button 
                      onClick={() => setActivePicker('evolution')}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200/50"
                    >
                      <Plus size={14} /> Salvar como Modelo
                    </button>
                  )}
                </div>
              </div>
              <textarea 
                rows={10}
                value={evolutionText}
                onChange={(e) => setEvolutionText(e.target.value)}
                placeholder="Descreva a evolução..."
                className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
              ></textarea>

              {/* Procedimentos Realizados (SIGTAP) Selector */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <div>
                  <h5 className="text-xs font-black uppercase text-indigo-600 tracking-widest flex items-center gap-1.5 mb-1">
                    <Stethoscope size={14} /> Procedimentos Realizados neste Atendimento (SIGTAP)
                  </h5>
                  <p className="text-[11px] text-slate-400 font-bold">Selecione os códigos de faturamento SIGTAP correspondentes a esta consulta.</p>
                </div>

                <div className="relative">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Pesquise por código ou nome do procedimento (ex: exodontia, radiografia, 041402)..."
                      value={procedureSearchTerm}
                      onChange={(e) => {
                        setProcedureSearchTerm(e.target.value);
                        setIsProcedureDropdownOpen(true);
                      }}
                      onFocus={() => setIsProcedureDropdownOpen(true)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300 shadow-sm"
                    />
                    {procedureSearchTerm && (
                      <button 
                        type="button"
                        onClick={() => {
                          setProcedureSearchTerm('');
                          setIsProcedureDropdownOpen(false);
                        }}
                        className="px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  {/* Dropdown containing filtered procedures */}
                  <AnimatePresence>
                    {isProcedureDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-20 left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl divide-y divide-slate-50/50"
                      >
                        {SIGTAP_PROCEDURES.filter(proc => {
                          const s = procedureSearchTerm.toLowerCase();
                          return proc.code.includes(s) || proc.name.toLowerCase().includes(s);
                        }).slice(0, 8).map((proc) => {
                          const isAlreadySelected = selectedProcedures.some(p => p.code === proc.code);
                          return (
                            <button
                              key={proc.code}
                              type="button"
                              onClick={() => {
                                if (!isAlreadySelected) {
                                  setSelectedProcedures([...selectedProcedures, proc]);
                                }
                                setProcedureSearchTerm('');
                                setIsProcedureDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-3.5 hover:bg-indigo-50/50 transition-colors flex items-center justify-between text-xs font-bold text-slate-700"
                            >
                              <div className="flex items-start gap-3">
                                <span className="font-mono text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded shrink-0">
                                  {proc.code}
                                </span>
                                <span className="text-slate-700 truncate max-w-[360px] md:max-w-[480px]">
                                  {proc.name}
                                </span>
                              </div>
                              {isAlreadySelected ? (
                                <span className="text-emerald-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-1">
                                  <Check size={12} /> Selecionado
                                </span>
                              ) : (
                                <span className="text-slate-300 text-[10px] uppercase font-black tracking-widest hover:text-indigo-600 transition-colors">
                                  Selecionar
                                </span>
                              )}
                            </button>
                          );
                        })}
                        {SIGTAP_PROCEDURES.filter(proc => {
                          const s = procedureSearchTerm.toLowerCase();
                          return proc.code.includes(s) || proc.name.toLowerCase().includes(s);
                        }).length === 0 && (
                          <div className="p-4 text-center text-xs text-slate-400 font-bold">
                            Nenhum procedimento encontrado correspondente à pesquisa.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Selected Procedures Row */}
                {selectedProcedures.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Procedimentos Selecionados ({selectedProcedures.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProcedures.map((proc) => (
                        <div 
                          key={proc.code}
                          className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 pl-1.5 pr-2.5 py-1 rounded-xl text-xs font-bold text-indigo-800"
                        >
                          <span className="font-mono text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded font-black">
                            {proc.code}
                          </span>
                          <span className="truncate max-w-[200px] md:max-w-xs">{proc.name}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedProcedures(selectedProcedures.filter(p => p.code !== proc.code))}
                            className="p-0.5 hover:bg-indigo-100 rounded-full text-indigo-400 hover:text-indigo-850 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => handleSaveRecord('evolucao', { text: evolutionText, procedures: selectedProcedures })} 
                  disabled={saving || !evolutionText} 
                  className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-colors shadow-lg shadow-emerald-50"
                >
                   {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Registrar Evolução
                </button>
              </div>
            </div>
          )}

          {/* CONTENT: PRESCRIÇÃO */}
          {activeTab === 'prescricao' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-10 text-white space-y-8">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
                  <Pill size={16} /> Nova Prescrição
                </h4>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsMedicationPickerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600/30 transition-all border border-indigo-500/20"
                  >
                    <Database size={14} /> Banco de Medicamentos
                  </button>
                  <button 
                    onClick={() => setActivePicker('prescription')}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white/70 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                  >
                    <LayoutTemplate size={14} /> Modelos de Receituário
                  </button>
                  {prescriptionForm.instructions && prescriptionForm.instructions.length > 5 && (
                    <button 
                      onClick={() => setActivePicker('prescription')}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white/40 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                    >
                      <Plus size={14} /> Salvar como Modelo
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Medicamento</label>
                  <input 
                    type="text" 
                    value={prescriptionForm.medicationName}
                    onChange={(e) => setPrescriptionForm(p => ({ ...p, medicationName: e.target.value }))}
                    placeholder="Ex: Amoxicilina 500mg"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Dosagem / Posologia</label>
                  <input 
                    type="text" 
                    value={prescriptionForm.dosage}
                    onChange={(e) => setPrescriptionForm(p => ({ ...p, dosage: e.target.value }))}
                    placeholder="Ex: 1 comprimido de 8/8h"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Orientações Adicionais</label>
                <textarea 
                  rows={4}
                  value={prescriptionForm.instructions}
                  onChange={(e) => setPrescriptionForm(p => ({ ...p, instructions: e.target.value }))}
                  placeholder="Ex: Tomar após as refeições..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button onClick={() => handleSaveRecord('prescricao', prescriptionForm)} disabled={saving || !prescriptionForm.medicationName} className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 flex items-center gap-3 hover:bg-indigo-700 transition-all active:scale-95">
                   {saving ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />} Salvar e Imprimir Prescrição
                </button>
              </div>
            </div>
          )}

          {/* CONTENT: ALTA */}
          {activeTab === 'alta' && (
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8">
              <textarea 
                rows={6}
                value={dischargeForm.foodRestrictions}
                onChange={(e) => setDischargeForm(p => ({ ...p, foodRestrictions: e.target.value }))}
                placeholder="Recomendações finais..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              ></textarea>
              <button onClick={() => handleSaveRecord('alta', dischargeForm)} disabled={saving} className="mt-10 px-12 py-5 bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                 {saving ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />} Finalizar Alta
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {/* Template Pickers */}
      <TemplatePicker 
        isOpen={activePicker === 'reason'}
        onClose={() => setActivePicker(null)}
        category="reason"
        currentContent={anamnesisForm.reasonForVisit}
        onSelect={(content) => setAnamnesisForm(prev => ({ ...prev, reasonForVisit: content }))}
      />
      <TemplatePicker 
        isOpen={activePicker === 'evolution'}
        onClose={() => setActivePicker(null)}
        category="evolution"
        currentContent={evolutionText}
        onSelect={(content) => setEvolutionText(content)}
      />
      <TemplatePicker 
        isOpen={activePicker === 'prescription'}
        onClose={() => setActivePicker(null)}
        category="prescription"
        currentContent={prescriptionForm.instructions}
        onSelect={(content) => {
          // For prescription, templates might be complex. 
          // Let's assume the template replaces the instructions for now.
          setPrescriptionForm(prev => ({ ...prev, instructions: content }));
        }}
      />
      <MedicationPicker 
        isOpen={isMedicationPickerOpen}
        onClose={() => setIsMedicationPickerOpen(false)}
        onSelect={(med) => {
          setPrescriptionForm({
            medicationName: med.name,
            dosage: med.defaultQuantity,
            instructions: med.defaultPosology
          });
          setIsMedicationPickerOpen(false);
        }}
      />

      {/* Floating Success Notification with framer-motion fade-in and scale */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-4 bg-emerald-600 border border-emerald-500 text-white pl-4 pr-6 py-4 rounded-2xl shadow-2xl shadow-emerald-950/15"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Check size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 leading-none mb-1">Sucesso</p>
              <p className="text-xs font-bold text-white leading-normal">O prontuário clínico foi registrado com êxito!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
