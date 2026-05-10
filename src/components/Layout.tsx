import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  UserCircle,
  Menu,
  X
} from 'lucide-react';
import { NAV_ITEMS, FOOTER_NAV, COLORS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-[#0f172a]">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#e2e8f0] z-50 flex items-center justify-between px-8 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
          >
            <Menu size={24} className="text-[#4f46e5]" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#4f46e5] rounded-md flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">H</div>
            <h1 className="text-lg font-bold text-[#0f172a] tracking-tight">
              Hospital Dr. Manoel Marinho Monte <span className="hidden sm:inline font-medium text-slate-400">| SESACRE</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-8">
          <div className="relative hidden md:flex items-center bg-[#f1f5f9] px-4 py-1.5 rounded-full border border-[#e2e8f0] transition-all focus-within:border-[#4f46e5] focus-within:bg-white">
            <Search size={16} className="text-[#94a3b8]" />
            <input 
              type="text" 
              placeholder="Buscar pacientes..."
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-48 lg:w-64 placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} className="text-[#475569]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 py-1.5 px-2 rounded-xl transition-all border border-transparent hover:border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center">
                <UserCircle size={28} className="text-slate-500" />
              </div>
              <span className="hidden sm:inline text-sm font-semibold text-[#0f172a]">Dr. Profissional</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-white border-r border-[#e2e8f0] z-40 transition-all duration-300 
          ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'}
          pt-16 pb-6 flex flex-col shadow-[1px_0_0_rgb(0,0,0,0.02)]`}
      >
        <div className="px-8 mt-8 mb-6 whitespace-nowrap overflow-hidden shrink-0">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Navegação</div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 hide-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 py-2.5 px-4 transition-all rounded-lg font-medium relative group
                  ${isActive 
                    ? 'bg-[#eef2ff] text-[#4f46e5]' 
                    : 'text-[#475569] hover:bg-slate-50 hover:text-[#0f172a]'}`}
              >
                <item.icon size={20} className={isActive ? 'text-[#4f46e5]' : 'text-slate-400 group-hover:text-slate-600'} />
                <span className={`text-sm whitespace-nowrap transition-all duration-300
                  ${!isSidebarOpen && 'lg:opacity-0 lg:hidden'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-5 bg-[#4f46e5] rounded-r-full"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto px-4 space-y-1">
          <div className="px-4 py-2">
            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-indigo-500/20 transition-all" />
              <p className="text-[10px] font-bold opacity-60 tracking-wider">SISTEMA v2.4</p>
              <p className="text-xs mt-1 font-medium leading-relaxed">Ambiente Estável Corporativo</p>
              <button className="mt-3 w-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold py-2 rounded-lg transition-colors backdrop-blur-sm">
                STATS DO SISTEMA
              </button>
            </div>
          </div>
          {FOOTER_NAV.map((item) => (
            <Link 
              key={item.id}
              to={item.path}
              className="flex items-center gap-3 py-2.5 px-4 text-[#475569] hover:bg-slate-50 hover:text-[#0f172a] transition-all rounded-lg font-medium"
            >
              <item.icon size={20} className="text-slate-400" />
              <span className={`text-sm whitespace-nowrap transition-all duration-300
                ${!isSidebarOpen && 'lg:opacity-0 lg:hidden'}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`transition-all duration-300 pt-24 p-8 min-h-screen
          ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
