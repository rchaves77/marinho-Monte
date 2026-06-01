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
  Info,
  FileSpreadsheet,
  Upload,
  Copy,
  FileText
} from 'lucide-react';
import { dataService, Medication } from '../lib/dataService';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = ["Antibiótico", "Anti-inflamatório", "Corticóide", "Opioide", "Anestésico", "Outros"];

const USABILITIES = [
  "Controle da Dor & Febre",
  "Anti-inflamatório (AINEs)",
  "Glicocorticóides (AIES)",
  "Processo Infeccioso",
  "Odontopediatria",
  "Sangramento Alveolar (Hemostasia)",
  "Antifúngicos & Antivirais",
  "Antissépticos Bucais",
  "Ansiolíticos (Anestesia/Sedação)",
  "Xerostomia (Hipossalivação)"
];

const INITIAL_MEDICATIONS: Omit<Medication, 'id' | 'createdAt' | 'createdBy'>[] = [
  // --- CONTROLE DA DOR E FEBRE ---
  {
    name: "Dipirona Monoidratada 1g",
    category: "Outros",
    defaultQuantity: "10 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 6 em 6 horas, em caso de dor ou febre (máximo 4 comprimidos por dia).",
    usability: "Controle da Dor & Febre"
  },
  {
    name: "Paracetamol 750mg",
    category: "Outros",
    defaultQuantity: "12 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 6 em 6 horas, em caso de dor ou febre (máximo 4g por dia). Evitar em hepatopatas.",
    usability: "Controle da Dor & Febre"
  },
  {
    name: "Ácido Mefenâmico 500mg (Pontin)",
    category: "Anti-inflamatório",
    defaultQuantity: "12 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 8 em 8 horas, para alívio de dor intensa, dor crônica ou muscular de origem odontológica.",
    usability: "Controle da Dor & Febre"
  },
  {
    name: "Ácido Acetilsalicílico 500mg (AAS)",
    category: "Anti-inflamatório",
    defaultQuantity: "10 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 4 em 4 horas ou 6 em 6 horas em caso de dor leve ou febre. Não usar em suspeitas de dengue ou viroses infantis.",
    usability: "Controle da Dor & Febras"
  },
  {
    name: "Paracetamol 500mg + Fosfato de Codeína 30mg (Tylex)",
    category: "Opioide",
    defaultQuantity: "12 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 4 a 6 horas em caso de dor moderada a intensa pós-extração ou cirurgia óssea.",
    usability: "Controle da Dor & Febre"
  },
  {
    name: "Cloridrato de Tramadol 50mg",
    category: "Opioide",
    defaultQuantity: "12 cápsulas",
    defaultPosology: "Tomar 01 cápsula Via Oral de 6 em 6 horas por até 3 dias, em caso de dor severa, DTM aguda ou dores neuropáticas.",
    usability: "Controle da Dor & Febre"
  },

  // --- PROCESSOS INFLAMATÓRIOS (AINES) ---
  {
    name: "Ibuprofeno 600mg",
    category: "Anti-inflamatório",
    defaultQuantity: "10 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 8 em 8 horas para controle de dor e inflamação aguda. Administrar com alimento.",
    usability: "Anti-inflamatório (AINEs)"
  },
  {
    name: "Nimesulida 100mg",
    category: "Anti-inflamatório",
    defaultQuantity: "06 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 12 em 12 horas por até 3 dias (potente ação anti-inflamatória em urgência de odontalgias).",
    usability: "Anti-inflamatório (AINEs)"
  },
  {
    name: "Diclofenaco Potássico 50mg",
    category: "Anti-inflamatório",
    defaultQuantity: "09 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 8 em 8 horas ou 12 em 12 horas por até 3 dias.",
    usability: "Anti-inflamatório (AINEs)"
  },
  {
    name: "Cetoprofeno 100mg",
    category: "Anti-inflamatório",
    defaultQuantity: "06 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 12 em 12 horas por até 3 dias.",
    usability: "Anti-inflamatório (AINEs)"
  },
  {
    name: "Cetorolaco de Trometamol (Toragesic) 10mg sublingual",
    category: "Anti-inflamatório",
    defaultQuantity: "10 comprimidos",
    defaultPosology: "Dissolver 01 comprimido debaixo da língua em caso de dor aguda pós-operatória intensa. Máximo 40mg/dia.",
    usability: "Anti-inflamatório (AINEs)"
  },
  {
    name: "Naproxeno 500mg",
    category: "Anti-inflamatório",
    defaultQuantity: "10 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 12 em 12 horas por até 5 dias (baixo risco de sangramento gastrointestinal).",
    usability: "Anti-inflamatório (AINEs)"
  },
  {
    name: "Celecoxibe 200mg (Inibidor Seletivo COX-2)",
    category: "Anti-inflamatório",
    defaultQuantity: "05 cápsulas",
    defaultPosology: "Tomar 01 cápsula Via Oral de 12 em 12 horas para dor e inflamação aguda pós-operatória.",
    usability: "Anti-inflamatório (AINEs)"
  },
  {
    name: "Etoricoxibe 90mg (Arcoxia)",
    category: "Anti-inflamatório",
    defaultQuantity: "03 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral uma vez ao dia por no máximo 3 dias (potente inibidor seletivo COX-2 para controle de dor e edema).",
    usability: "Anti-inflamatório (AINEs)"
  },
  {
    name: "Meloxicam 15mg",
    category: "Anti-inflamatório",
    defaultQuantity: "03 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral ao dia por até 3 dias para tratamento de dor aguda da ATM ou pós-operatória.",
    usability: "Anti-inflamatório (AINEs)"
  },
  {
    name: "Tenoxicam 20mg",
    category: "Anti-inflamatório",
    defaultQuantity: "05 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral ao dia por até 5 dias (longa meia-vida para controle sistemático de dor).",
    usability: "Anti-inflamatório (AINEs)"
  },

  // --- CORTICOSTEROIDES / INFLAMATÓRIOS ESTEROIDAIS (AIES) ---
  {
    name: "Dexametasona 4mg",
    category: "Corticóide",
    defaultQuantity: "02 comprimidos",
    defaultPosology: "Tomar 1 a 2 comprimidos (4mg a 8mg) Via Oral in dose única, 1 hora antes de cirurgias traumáticas (terapia preventiva).",
    usability: "Glicocorticóides (AIES)"
  },
  {
    name: "Betametasona 2mg",
    category: "Corticóide",
    defaultQuantity: "01 comprimido",
    defaultPosology: "Tomar 01 comprimido Via Oral em dose única pré-operatória, 1 hora antes do procedimento cirúrgico complexo.",
    usability: "Glicocorticóides (AIES)"
  },
  {
    name: "Prednisona 20mg (Meticorten)",
    category: "Corticóide",
    defaultQuantity: "05 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral uma vez ao dia pela manhã (dose única diária) durante 3 a 5 dias.",
    usability: "Glicocorticóides (AIES)"
  },
  {
    name: "Prednisolona 3mg/ml Solução Oral",
    category: "Corticóide",
    defaultQuantity: "01 frasco",
    defaultPosology: "Tomar ____ ml Via Oral uma vez ao dia pela manhã, por 3 dias (preferível em dosagem com menor impacto sistêmico em terapia curta).",
    usability: "Glicocorticóides (AIES)"
  },
  {
    name: "Triancinolona Acetonida 1mg/g pomada (Oncilon A em Orabase)",
    category: "Corticóide",
    defaultQuantity: "1 bisnaga (10g)",
    defaultPosology: "Aplicar uma pequena quantidade sobre a lesão (afta, úlcera traumática) sem esfregar, até formar película lisa protetora. Usar 2 a 4 vezes ao dia. Não comer por 30min.",
    usability: "Glicocorticóides (AIES)"
  },
  {
    name: "Propionato de Clobetazol 0,05% Gel (Alta Potência)",
    category: "Corticóide",
    defaultQuantity: "1 bisnaga (30g)",
    defaultPosology: "Uso Tópico. Aplicar fina camada sobre a lesão com auxílio de cotonete, 2 vezes ao dia por até 15 dias (indicado para líquen plano erosivo e pênfigo). Reavaliar pelo estomatologista.",
    usability: "Glicocorticóides (AIES)"
  },
  {
    name: "Dexametasona Elixir 0,1mg/ml (Colutório)",
    category: "Corticóide",
    defaultQuantity: "1 frasco (120ml)",
    defaultPosology: "Fazer bochecho com 1 colher de sopa por 2 minutos, 3 a 4 vezes ao dia e cuspir, para controle de feridas extensas e estomatite.",
    usability: "Glicocorticóides (AIES)"
  },

  // --- PROCESSOS INFECCIOSOS / ANTIBIÓTICOS ---
  {
    name: "Amoxicilina 500mg",
    category: "Antibiótico",
    defaultQuantity: "21 cápsulas",
    defaultPosology: "Tomar 01 cápsula Via Oral de 8 em 8 horas por 07 dias (para infecção odontogênica ativa).",
    usability: "Processo Infeccioso"
  },
  {
    name: "Amoxicilina + Clavulanato de Potássio 875mg+125mg (Clavulin)",
    category: "Antibiótico",
    defaultQuantity: "14 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 12 em 12 horas por 07 dias (indicado para cepas produtoras de beta-lactamase). Enjoos podem ocorrer, tomar no início das refeições.",
    usability: "Processo Infeccioso"
  },
  {
    name: "Amoxicilina 1g (Prevenção de Endocardite / Profilaxia)",
    category: "Antibiótico",
    defaultQuantity: "04 comprimidos",
    defaultPosology: "Tomar 4 comprimidos de 500mg (2g) em dose única Via Oral, 1 hora antes do procedimento cirúrgico ou periodontal invasivo.",
    usability: "Processo Infeccioso"
  },
  {
    name: "Cefalexina 500mg",
    category: "Antibiótico",
    defaultQuantity: "28 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 12 em 12 horas ou de 6 em 6 horas por 07 dias (infecções cutâneas ou faciais periodontais).",
    usability: "Processo Infeccioso"
  },
  {
    name: "Azitromicina 500mg",
    category: "Antibiótico",
    defaultQuantity: "03 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral uma vez ao dia por 3 dias (ótima alternativa para pacientes alérgicos à penicilina).",
    usability: "Processo Infeccioso"
  },
  {
    name: "Clindamicina 300mg",
    category: "Antibiótico",
    defaultQuantity: "21 cápsulas",
    defaultPosology: "Tomar 01 cápsula Via Oral de 8 em 8 horas por 7 dias. Ótima difusão e concentração em tecido ósseo (alérgicos a penicilina).",
    usability: "Processo Infeccioso"
  },
  {
    name: "Metronidazol 400mg",
    category: "Antibiótico",
    defaultQuantity: "14 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 12 em 12 horas ou de 8 em 8 horas por 7 dias. Frequentemente associado à Amoxicilina para infecção anaeróbia severa.",
    usability: "Processo Infeccioso"
  },

  // --- ODONTOPEDIATRIA / PEDIATRIA ---
  {
    name: "Paracetamol Gotas 200mg/ml (Pediatria)",
    category: "Outros",
    defaultQuantity: "01 frasco conta-gotas",
    defaultPosology: "Administrar por Via Oral 1 gota por quilograma de peso da criança (máximo de 35 gotas por dose), de 6 em 6 horas, em caso de dor ou febre infantil.",
    usability: "Odontopediatria"
  },
  {
    name: "Dipirona Sódica Gotas 500mg/ml (Pediatria)",
    category: "Outros",
    defaultQuantity: "01 frasco conta-gotas",
    defaultPosology: "Administrar por Via Oral 1 gota para cada 2 kg de peso corporal (limite de 20 gotas), de 6 em 6 horas, para dor ou febre. Contraindicado para menores de 3 meses.",
    usability: "Odontopediatria"
  },
  {
    name: "Ibuprofeno Gotas 50mg/ml (Odontopediatria)",
    category: "Anti-inflamatório",
    defaultQuantity: "01 frasco conta-gotas",
    defaultPosology: "Administrar por Via Oral 1 a 2 gotas por kg de peso corporal da criança (máximo 40 gotas), de 6 em 6 horas ou de 8 em 8 horas. Excelente potencial analgésico e anti-inflamatório.",
    usability: "Odontopediatria"
  },
  {
    name: "Amoxicilina 250mg/5ml Pó para Suspensão Oral",
    category: "Antibiótico",
    defaultQuantity: "01 frasco",
    defaultPosology: "Dose diária ideal: 50mg/kg/dia dividido em 3 tomadas Via Oral de 8 em 8 horas, por 7 dias. (Ex: Criança de 20kg deve tomar 6,6ml a cada 8 horas).",
    usability: "Odontopediatria"
  },
  {
    name: "Amoxicilina 500mg/5ml Pó para Suspensão Oral",
    category: "Antibiótico",
    defaultQuantity: "01 frasco",
    defaultPosology: "Tomar de acordo com o cálculo de peso da criança (max 50mg/kg/dia divididos de 8 em 8 horas) por 7 dias. (Ex: Criança de 20kg deve tomar 3,3ml a cada 8 horas).",
    usability: "Odontopediatria"
  },
  {
    name: "Eritromicina 250mg/5ml Pó para Suspensão",
    category: "Antibiótico",
    defaultQuantity: "01 frasco",
    defaultPosology: "Administrar de acordo com o cálculo de peso. Dose pediátrica usual: 10mg/kg/dia dividido em 4 doses dadas Via Oral de 6 em 6 horas. (Ex: Criança de 20kg toma 1ml de 6h/6h).",
    usability: "Odontopediatria"
  },
  {
    name: "Midazolam Solução Oral 2mg/ml (Sedação Infantil)",
    category: "Anestésico",
    defaultQuantity: "01 frasco",
    defaultPosology: "Uso Exclusivo em Consultório. Dose sugerida: 0,25mg a 0,5mg por kg de peso corporal (limite absoluto de 20mg), por Via Oral de 15 a 30 minutos antes de procedimentos.",
    usability: "Odontopediatria"
  },
  {
    name: "Nistatina Suspensão Oral 100.000 UI/ml (Sapinho)",
    category: "Outros",
    defaultQuantity: "01 frasco",
    defaultPosology: "Pingar ou pincelar 1ml de suspensão de cada lado da boca/bochechas internas da criança de 6 em 6 horas por 14 dias para sapinho oral. Higienizar bico/mamadeiras.",
    usability: "Odontopediatria"
  },
  {
    name: "Camomilina C Cápsulas (Dentição)",
    category: "Outros",
    defaultQuantity: "01 caixa",
    defaultPosology: "Uso Tópico Gingival. Abrir a cápsula e massagear o pó sutilmente sobre a gengiva inflamada da criança em erupção dentária, até 2 vezes ao dia. Não deglutir cápsula.",
    usability: "Odontopediatria"
  },
  {
    name: "Admuc Pomada Fitoterápica",
    category: "Outros",
    defaultQuantity: "1 bisnaga (10g)",
    defaultPosology: "Aplicar fina camada sobre aftas, queilite angular ou lesões bucais infantis, de 2 a 3 vezes ao dia (composto por extrato fluido de Camomila). Acima de 3 anos.",
    usability: "Odontopediatria"
  },

  // --- CONTROLE DE SANGRAMENTO / HEMOSTASIA ---
  {
    name: "Esponja de Colágeno Hemostática Estéril (Hemospon)",
    category: "Outros",
    defaultQuantity: "01 envelope",
    defaultPosology: "Uso Local em Consultório. Inserir a esponja de colágeno dentro do alvéolo sangrante limpo e suturar em X. Agiliza a formação e sustentação do coágulo primário.",
    usability: "Sangramento Alveolar (Hemostasia)"
  },
  {
    name: "Ácido Tranexâmico 250mg (Bochecho ou Compressa)",
    category: "Outros",
    defaultQuantity: "12 comprimidos",
    defaultPosology: "Para controle antifibrinolítico: triturar 1 comprimido, dissolver em 10ml de água destilada ou estéril, embeber em gaze e fixar sob compressão suave por 20min.",
    usability: "Sangramento Alveolar (Hemostasia)"
  },
  {
    name: "Ácido Aminocaproico 250mg/ml Solução Oral (Ipsilon)",
    category: "Outros",
    defaultQuantity: "01 frasco",
    defaultPosology: "Uso Tópico/Bochecho local com 10ml de solução por 2 minutos de 6 em 6 horas por 2 dias. Também pode umedecer gaze local sobre o alvéolo.",
    usability: "Sangramento Alveolar (Hemostasia)"
  },
  {
    name: "Hemostop Líquido (Cloreto de Alumínio)",
    category: "Outros",
    defaultQuantity: "01 frasco (10ml)",
    defaultPosology: "Uso profissional local em campo cirúrgico ou fio retrator. Aplicar compressão com bolinha de algodão embebida no líquido por 1 a 2 minutos para cessar hemorragia de capilares.",
    usability: "Sangramento Alveolar (Hemostasia)"
  },

  // --- ANTIFÚNGICOS E ANTIVIRAIS ---
  {
    name: "Aciclovir 200mg (Herpes Simples)",
    category: "Outros",
    defaultQuantity: "25 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 4 em 4 horas (omitindo dose noturna - 5x ao dia) por 5 dias. Iniciar imediatamente no pródromo das lesões.",
    usability: "Antifúngicos & Antivirais"
  },
  {
    name: "Miconazol Gel Oral 2g (Daktarin)",
    category: "Outros",
    defaultQuantity: "01 bisnaga (40g)",
    defaultPosology: "Aplicar 1/2 colher de chá sobre as lesões de candidose na boca, 4 vezes ao dia por 14 dias. Manter na boca o maior tempo possível antes de engolir.",
    usability: "Antifúngicos & Antivirais"
  },
  {
    name: "Fluconazol 150mg (Candidíase Sistêmica)",
    category: "Outros",
    defaultQuantity: "01 cápsula",
    defaultPosology: "Tomar 01 cápsula Via Oral em dose única semanal por 2 semanas para casos de candidose eritematosa ou atrófica associada à prótese.",
    usability: "Antifúngicos & Antivirais"
  },
  {
    name: "Valaciclovir 500mg",
    category: "Outros",
    defaultQuantity: "10 comprimidos",
    defaultPosology: "Tomar 02 comprimidos Via Oral de 12 em 12 horas por até 5 dias (indicado para surtos recorrentes de herpes labial).",
    usability: "Antifúngicos & Antivirais"
  },

  // --- ANTISSÉPTICOS ---
  {
    name: "Digluconato de Clorexidina 0,12% (Sem Álcool)",
    category: "Outros",
    defaultQuantity: "01 frasco",
    defaultPosology: "Enxaguar a boca with 15ml da solução por 1 minuto de 12 em 12 horas, idealmente 30 minutos após a escovação dentária. Usar por no máximo 14 dias.",
    usability: "Antissépticos Bucais"
  },
  {
    name: "Cloreto de Cetilpiridínio pastilhas (Cepacol/Neopiridin)",
    category: "Outros",
    defaultQuantity: "12 pastilhas",
    defaultPosology: "Deixar dissolver lentamente na boca 1 pastilha a cada 4 horas (limite de 6 por dia) para analgesia tópica sintomática de faringites e aftas.",
    usability: "Antissépticos Bucais"
  },
  {
    name: "Peróxido de Hidrogênio 10 Volumes (Diluído)",
    category: "Outros",
    defaultQuantity: "01 frasco",
    defaultPosology: "Bochecho e gargarejo. Diluir 1 colher de sopa de água oxigenada 10 volumes em 1/2 copo de água fervida ou filtrada e realizar bochechos após as refeições.",
    usability: "Antissépticos Bucais"
  },

  // --- COMPORTAMENTAIS / BENZODIAZEPÍNICOS ---
  {
    name: "Diazepam 5mg / 10mg",
    category: "Anestésico",
    defaultQuantity: "02 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 5mg/10mg na véspera da cirurgia antes de dormir, ou dose única 1 hora antes do procedimento cirúrgico clínico.",
    usability: "Ansiolíticos (Anestesia/Sedação)"
  },
  {
    name: "Midazolam 15mg (Maleato de Midazolam)",
    category: "Anestésico",
    defaultQuantity: "02 comprimidos",
    defaultPosology: "Uso Profissional. Tomar 01 comprimido (7.5mg ou 15mg) 30 a 45 minutos antes do procedimento, para indução de sedação consciente em consultório.",
    usability: "Ansiolíticos (Anestesia/Sedação)"
  },
  {
    name: "Alprazolam 0,5mg",
    category: "Anestésico",
    defaultQuantity: "02 comprimidos",
    defaultPosology: "Tomar 01 comprimido Via Oral de 30 a 60 minutos antes do procedimento para controle de ansiedade em sessões de média duração.",
    usability: "Ansiolíticos (Anestesia/Sedação)"
  },

  // --- XEROSTOMIA ---
  {
    name: "Cloridrato de Pilocarpina 5mg (Salagen)",
    category: "Outros",
    defaultQuantity: "30 comprimidos",
    defaultPosology: "Tomar 01 comprimido de 5mg Via Oral 3 vezes ao dia, 30 minutos antes das refeições (para alívio de hipossalivação crônica severa pós-radioterapia).",
    usability: "Xerostomia (Hipossalivação)"
  },
  {
    name: "Saliva Artificial Spray com Sais Minerais & Xilitol",
    category: "Outros",
    defaultQuantity: "01 frasco spray",
    defaultPosology: "Efetuar 2 a 3 pulverizações diretamente na cavidade oral várias vezes ao dia, conforme a necessidade de hidratação. Não ingerir alimentos por 15min.",
    usability: "Xerostomia (Hipossalivação)"
  }
];

export default function MedicationManagement() {
  const { user, profile } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUsability, setSelectedUsability] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [importingProgress, setImportingProgress] = useState<{current: number, total: number} | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [parsedList, setParsedList] = useState<Omit<Medication, 'id' | 'createdAt' | 'createdBy'>[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Antibiótico' as Medication['category'],
    defaultQuantity: '',
    defaultPosology: '',
    usability: ''
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

  useEffect(() => {
    if (!pasteContent) {
      setParsedList([]);
      return;
    }

    const lines = pasteContent.split('\n');
    const result: Omit<Medication, 'id' | 'createdAt' | 'createdBy'>[] = [];

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      // Determine separator: Tab (Excel paste), Semicolon, Comma, Dash
      let parts: string[] = [];
      if (cleanLine.includes('\t')) {
        parts = cleanLine.split('\t');
      } else if (cleanLine.includes(';')) {
        parts = cleanLine.split(';');
      } else if (cleanLine.includes(' - ')) {
        parts = cleanLine.split(' - ');
      } else if (cleanLine.includes(',')) {
        parts = cleanLine.split(',');
      } else {
        parts = [cleanLine];
      }

      const cleanedParts = parts.map(p => p.trim());

      if (cleanedParts.length > 0) {
        const name = cleanedParts[0] || '';
        // Skip header lines
        if (!name || name.toLowerCase() === 'nome' || name.toLowerCase() === 'medicamento' || name.toLowerCase() === 'name') return;

        let category = 'Outros' as Medication['category'];
        const inputCat = (cleanedParts[1] || '').toLowerCase();
        if (inputCat.includes('antibio') || inputCat.includes('amoxi') || inputCat.includes('peni')) {
          category = 'Antibiótico';
        } else if (inputCat.includes('inflama') || inputCat.includes('aine')) {
          category = 'Anti-inflamatório';
        } else if (inputCat.includes('corti') || inputCat.includes('esteroi') || inputCat.includes('predni')) {
          category = 'Corticóide';
        } else if (inputCat.includes('opio') || inputCat.includes('dor') || inputCat.includes('tramad') || inputCat.includes('codei')) {
          category = 'Opioide';
        } else if (inputCat.includes('aneste') || inputCat.includes('seda') || inputCat.includes('benzo')) {
          category = 'Anestésico';
        } else if (CATEGORIES.includes(cleanedParts[1] as any)) {
          category = cleanedParts[1] as any;
        }

        const quantity = cleanedParts[2] || '01 caixa';
        const posology = cleanedParts[3] || 'De acordo com orientação clínica.';
        
        let usability = cleanedParts[4] || '';
        if (!usability) {
          if (category === 'Antibiótico') usability = 'Processo Infeccioso';
          else if (category === 'Corticóide') usability = 'Glicocorticóides (AIES)';
          else if (category === 'Opioide') usability = 'Controle da Dor & Febre';
          else {
            const lowName = name.toLowerCase();
            if (lowName.includes('sangra') || lowName.includes('alveol') || lowName.includes('hemos')) usability = 'Sangramento Alveolar (Hemostasia)';
            else if (lowName.includes('pediat') || lowName.includes('gotas') || lowName.includes('infant')) usability = 'Odontopediatria';
            else usability = 'Controle da Dor & Febre';
          }
        }

        result.push({
          name,
          category,
          defaultQuantity: quantity,
          defaultPosology: posology,
          usability
        });
      }
    });

    setParsedList(result);
  }, [pasteContent]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setPasteContent(text);
      }
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (!user) {
      alert('Você precisa estar logado para importar.');
      return;
    }
    if (parsedList.length === 0) {
      alert('Nenhum item válido parseado do arquivo ou do texto colado.');
      return;
    }

    setSaving(true);
    setImportingProgress({ current: 0, total: parsedList.length });

    try {
      let added = 0;
      let skipped = 0;

      const currentMeds = await dataService.getMedications();
      const currentNames = new Set(currentMeds?.map(m => m.name.toLowerCase()) || []);

      for (let i = 0; i < parsedList.length; i++) {
        const med = parsedList[i];
        setImportingProgress({ current: i + 1, total: parsedList.length });

        if (!currentNames.has(med.name.toLowerCase())) {
          await dataService.saveMedication({
            ...med,
            createdBy: user.uid
          });
          added++;
        } else {
          skipped++;
        }
      }

      await loadMedications();
      alert(`Importação em lote concluída com sucesso!\n\nMedicamentos novos importados: ${added}\nIgnorados (já existentes no banco): ${skipped}`);
      setIsImportModalOpen(false);
      setPasteContent('');
    } catch (err) {
      console.error(err);
      alert('Houve um erro técnico durante a importação.');
    } finally {
      setSaving(false);
      setImportingProgress(null);
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
      setFormData({ name: '', category: 'Antibiótico', defaultQuantity: '', defaultPosology: '', usability: '' });
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
    const matchesUsability = selectedUsability === 'all' || med.usability === selectedUsability;
    return matchesSearch && matchesCategory && matchesUsability;
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
                onClick={() => {
                  setPasteContent('');
                  setParsedList([]);
                  setIsImportModalOpen(true);
                }}
                disabled={saving || !!importingProgress}
                className="px-4 py-2 border border-emerald-100 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-emerald-100 transition-all disabled:opacity-50"
              >
                <FileSpreadsheet size={16} /> Importar Listas
              </button>
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
                  setFormData({ name: '', category: 'Antibiótico', defaultQuantity: '', defaultPosology: '', usability: '' });
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
        <div className="space-y-5 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar medicamento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Classe Farmacológica</span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {["all", ...CATEGORIES].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'Todas' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Usabilidade / Uso Clínico</span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {["all", ...USABILITIES].map(usb => (
                <button 
                  key={usb}
                  onClick={() => setSelectedUsability(usb)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    selectedUsability === usb ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {usb === 'all' ? 'Todos os Usos' : usb}
                </button>
              ))}
            </div>
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
                          setFormData({ 
                            name: med.name, 
                            category: med.category, 
                            defaultQuantity: med.defaultQuantity, 
                            defaultPosology: med.defaultPosology,
                            usability: med.usability || ''
                          });
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
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50/50 px-2 py-0.5 rounded-full tracking-wider">{med.category}</span>
                  {med.usability && (
                    <span className="text-[10px] font-black uppercase text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full tracking-wider">{med.usability}</span>
                  )}
                </div>
                
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Usabilidade / Uso Clínico (Indicação)</label>
                    <select 
                      value={formData.usability}
                      onChange={(e) => setFormData({...formData, usability: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none font-medium"
                    >
                      <option value="">Nenhum específico (Outros)</option>
                      {USABILITIES.map(usb => <option key={usb} value={usb}>{usb}</option>)}
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

      {/* Modal de Importação em Lote */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!saving) setIsImportModalOpen(false);
              }}
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl p-8 overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                    <FileSpreadsheet size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-widest leading-none mb-1">Importação de Listas</h3>
                    <p className="text-[10px] text-slate-400 font-bold">Faça upload ou cole listas do Word, Excel, CSV ou cadernos de prescrições</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsImportModalOpen(false)} 
                  disabled={saving}
                  className="p-2 text-slate-300 hover:text-slate-900 transition-colors disabled:opacity-35"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto py-6 pr-1 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Option A: Upload file */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-slate-700 text-[10px] uppercase tracking-wider mb-2">📁 Opção 1: Carregar Arquivos</h4>
                      <p className="text-xs text-slate-500 leading-normal mb-4">Selecione qualquer arquivo formatado de sua máquina (Word, Excel, planilhas salvas como <strong>CSV ou TXT</strong>).</p>
                    </div>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:bg-white rounded-xl py-6 px-4 bg-white/50 cursor-pointer transition-all hover:border-emerald-500 group">
                      <Upload size={24} className="text-slate-400 group-hover:text-emerald-500 transition-colors mb-2" />
                      <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider group-hover:text-emerald-700">Carregar Planilha/TXT</span>
                      <span className="text-[9px] text-slate-400 font-medium mt-1">Sufixos: .csv, .txt, .tsv</span>
                      <input 
                        type="file" 
                        accept=".txt,.csv,.tsv" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* Option B: Copy Paste instructions */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-slate-700 text-[10px] uppercase tracking-wider mb-1">📋 Instruções Rápidas</h4>
                      <p className="text-xs text-slate-500 leading-normal">
                        Você também pode simplesmente copiar dados de uma planilha/tabela e colar na caixa abaixo. O separador pode ser ponto-e-vírgula <strong>(;)</strong> ou tabulações: <br />
                        <code className="text-[9px] bg-slate-200 text-slate-800 rounded px-1 font-mono">Nome; Categoria; Quantidade; Posologia; Indicação</code>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => setPasteContent(
                          "Aceclofenaco 100mg; Anti-inflamatório; 12 comprimidos; Tomar 1 comprimido de 12 em 12 horas; Controle da Dor & Febre\n" +
                          "Amoxicilina 500mg; Antibiótico; 21 cápsulas; Tomar 1 cápsula de 8 em 8 horas; Processo Infeccioso\n" +
                          "Paracetamol Gotas 200mg/mL; Outros; 1 frasco de 15mL; Administrar 20 gotas a cada 6 horas; Odontopediatria"
                        )}
                        className="flex items-center gap-1.5 py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-[10px] text-slate-600 font-bold uppercase tracking-wider hover:bg-slate-100 transition-all shadow-sm"
                      >
                        <Copy size={12} /> Carregar Exemplo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Paste Area */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Conteúdo das Medicação (Texto ou Arquivo importado):</label>
                  <textarea 
                    rows={6}
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    placeholder="Cole aqui suas colunas de medicamentos ou aguarde o upload do arquivo..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs font-mono outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all text-slate-800"
                  />
                </div>

                {/* Parsed List Preview Grid */}
                {parsedList.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-550 uppercase tracking-widest flex items-center gap-2">
                        🔎 Pré-visualização ({parsedList.length} itens localizados)
                      </span>
                      <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                        Processado
                      </span>
                    </div>

                    <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-56 overflow-y-auto bg-slate-50 scrollbar-thin">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-black text-slate-505 uppercase tracking-wider">
                            <th className="py-2.5 px-4">Medicamento</th>
                            <th className="py-2.5 px-4">Categoria</th>
                            <th className="py-2.5 px-4">Qtd. Padrão</th>
                            <th className="py-2.5 px-4">Posologia</th>
                            <th className="py-2.5 px-4">Uso Clínico</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                          {parsedList.map((med, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-4 font-extrabold text-indigo-700">{med.name}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                  med.category === 'Antibiótico' ? 'bg-rose-50 text-rose-600' :
                                  med.category === 'Anti-inflamatório' ? 'bg-amber-50 text-amber-600' :
                                  med.category === 'Corticóide' ? 'bg-sky-50 text-sky-600' :
                                  med.category === 'Opioide' ? 'bg-purple-50 text-purple-600' :
                                  med.category === 'Anestésico' ? 'bg-indigo-50 text-indigo-700' :
                                  'bg-slate-100 text-slate-500'
                                }`}>
                                  {med.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-500 text-[11px]">{med.defaultQuantity}</td>
                              <td className="py-3 px-4 font-sans text-[11px] text-slate-400 italic max-w-xs truncate" title={med.defaultPosology}>
                                {med.defaultPosology}
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                                  {med.usability}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress and Actions */}
              <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
                {importingProgress ? (
                  <div className="w-full md:w-1/2 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wildest leading-none">
                      <span>Efetuando importação...</span>
                      <span>{Math.round((importingProgress.current / importingProgress.total) * 100)}% ({importingProgress.current}/{importingProgress.total})</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${(importingProgress.current / importingProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Info size={14} /> Total Pronto: {parsedList.length} Medicamento(s)
                  </div>
                )}

                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    disabled={saving}
                    className="flex-1 md:flex-initial py-3.5 px-6 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all border border-slate-100"
                  >
                    Fechar
                  </button>
                  <button 
                    type="button"
                    onClick={handleBulkImport}
                    disabled={saving || parsedList.length === 0}
                    className="flex-[2] md:flex-initial py-3.5 px-8 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-50 flex items-center justify-center gap-2 hover:bg-emerald-750 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Processando...
                      </>
                    ) : (
                      <>
                        <Save size={16} /> Salvar Tudo ({parsedList.length})
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
