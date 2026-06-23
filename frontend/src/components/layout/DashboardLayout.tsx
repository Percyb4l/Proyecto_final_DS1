import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, Calendar, ClipboardList,
  CreditCard, CheckSquare, LogOut, Menu, X, Music2
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students', icon: Users, label: 'Estudiantes' },
  { to: '/instructors', icon: GraduationCap, label: 'Instructores' },
  { to: '/classes', icon: Calendar, label: 'Clases' },
  { to: '/enrollments', icon: ClipboardList, label: 'Inscripciones' },
  { to: '/payments', icon: CreditCard, label: 'Pagos' },
  { to: '/attendance', icon: CheckSquare, label: 'Asistencia' },
];

const instructorLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/classes', icon: Calendar, label: 'Mis Clases' },
  { to: '/attendance', icon: CheckSquare, label: 'Asistencia' },
];

const studentLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Mi Panel' },
  { to: '/classes', icon: Calendar, label: 'Clases' },
  { to: '/enrollments', icon: ClipboardList, label: 'Mis Inscripciones' },
  { to: '/payments', icon: CreditCard, label: 'Mis Pagos' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin, isInstructor } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = isAdmin ? adminLinks : isInstructor ? instructorLinks : studentLinks;

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1a1225] border-r border-[#2d1f42] transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-[#2d1f42]">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Music2 className="w-8 h-8 text-violet-400" />
            <div>
              <h1 className="font-display text-lg font-bold gradient-text">Dance Academy</h1>
              <p className="text-xs text-gray-500">Sistema de Gestión</p>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#2d1f42]">
          <div className="text-sm text-gray-400 mb-2 truncate">{user?.email}</div>
          <div className="text-xs text-violet-400 capitalize mb-3">{user?.role}</div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-[#2d1f42] bg-[#1a1225]">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-display font-bold gradient-text">Dance Academy</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6 opacity-0" />
          </button>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
