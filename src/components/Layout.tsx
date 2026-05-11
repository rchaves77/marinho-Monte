import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  UserCircle,
  Menu,
  X,
  LogIn,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { NAV_ITEMS, FOOTER_NAV, COLORS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, profile, signIn, signOut, toggleRole, isOverrideActive } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();

  // Define menu items based on role
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    if (profile.role === 'professional') return true;
    if (profile.role === 'administrative') {
      return item.path === '/' || item.path === '/relatorio';
    }
    return false;
  });

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
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 py-1.5 px-2 rounded-xl transition-all border border-transparent hover:border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shadow-inner">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle size={28} className="text-slate-500" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-[#0f172a] leading-none">{user.displayName || 'Médico'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-[8px] font-black uppercase tracking-widest ${isOverrideActive ? 'text-amber-500' : 'text-indigo-500'}`}>
                        {profile?.role} {isOverrideActive && '(Override)'}
                      </p>
                      {user.email === 'romulochaves77@gmail.com' && (
                        <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             toggleRole();
                          }}
                          className="text-[7px] font-black uppercase bg-slate-100 hover:bg-slate-200 px-1 rounded transition-colors text-slate-500"
                        >
                          Trocar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={signOut}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Sair"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={signIn}
                className="flex items-center gap-2 bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-indigo-100 hover:bg-[#4338ca] transition-all"
              >
                <LogIn size={18} />
                Acessar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-white border-r border-[#e2e8f0] z-40 transition-all duration-300 
          ${isSidebarOpen 
            ? 'w-64 translate-x-0' 
            : '-translate-x-full lg:translate-x-0 lg:w-20'}
          pt-16 pb-6 flex flex-col shadow-[1px_0_0_rgb(0,0,0,0.02)] overflow-hidden`}
      >
        <div className={`px-8 mt-8 mb-6 whitespace-nowrap overflow-hidden shrink-0 transition-opacity duration-300 ${!isSidebarOpen && 'lg:opacity-0 lg:hidden'}`}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Navegação</div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 hide-scrollbar">
          {filteredNavItems.map((item) => {
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
          
          {/* Admin Tools */}
          {profile?.role === 'admin' && (
             <div className="pt-4 border-t border-slate-100 mt-4">
                <Link 
                  to="/admin/usuarios"
                  className={`flex items-center gap-3 py-2.5 px-4 transition-all rounded-lg font-medium group
                    ${location.pathname === '/admin/usuarios' 
                      ? 'bg-[#0f172a] text-white' 
                      : 'text-[#475569] hover:bg-slate-50 hover:text-[#0f172a]'}`}
                >
                  <ShieldCheck size={20} className={location.pathname === '/admin/usuarios' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                  <span className={`text-sm whitespace-nowrap transition-all duration-300
                    ${!isSidebarOpen && 'lg:opacity-0 lg:hidden'}`}>
                    Gerir Usuários
                  </span>
                </Link>
             </div>
          )}
        </nav>

        <div className="mt-auto px-4 space-y-1 overflow-hidden">
          <div className={`px-4 py-2 transition-all duration-300 ${!isSidebarOpen ? 'lg:opacity-0 lg:invisible lg:h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
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
