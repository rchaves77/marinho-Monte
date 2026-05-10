import { 
  LayoutDashboard, 
  UserPlus, 
  Stethoscope, 
  History, 
  Pill, 
  LogOut, 
  FileText,
  Settings,
  Bell,
  Search,
  UserCircle
} from 'lucide-react';

export const COLORS = {
  primary: '#4f46e5', // indigo-600
  primaryLight: '#eef2ff', // indigo-50
  secondary: '#0f172a', // slate-900
  background: '#f8fafc', // slate-50
  surface: '#ffffff',
  outline: '#e2e8f0', // slate-200
  textPrimary: '#0f172a', // slate-900
  textSecondary: '#475569', // slate-600
  textMuted: '#94a3b8', // slate-400
  error: '#e11d48', // rose-600
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
};

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'registration', label: 'Cadastro do Paciente', icon: UserPlus, path: '/cadastro' },
  { id: 'anamnesis', label: 'Anamnese', icon: FileText, path: '/anamnese' },
  { id: 'evolution', label: 'Evolução', icon: History, path: '/evolucao' },
  { id: 'prescription', label: 'Prescrição', icon: Pill, path: '/prescricao' },
  { id: 'discharge', label: 'Condições de Alta', icon: LogOut, path: '/alta' },
  { id: 'report', label: 'Relatório Dental', icon: FileText, path: '/relatorio' },
];

export const FOOTER_NAV = [
  { id: 'settings', label: 'Configurações', icon: Settings, path: '/configuracoes' },
  { id: 'logout', label: 'Sair', icon: LogOut, path: '/logout' },
];
