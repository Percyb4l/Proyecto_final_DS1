/**
 * Layout lateral del panel de administración (sidebar + contenido).
 */
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Music, ShoppingBag, GraduationCap, Settings, LogOut, ClipboardList } from 'lucide-react';

const baseLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/users', icon: Users, label: 'Usuarios' },
  { to: '/admin/choreographies', icon: Music, label: 'Coreografías' },
  { to: '/admin/sales', icon: ShoppingBag, label: 'Ventas' },
  { to: '/admin/professors', icon: GraduationCap, label: 'Profesores' },
  { to: '/admin/settings', icon: Settings, label: 'Configuración' },
];

const directorLinks = [
  { to: '/admin/applications', icon: ClipboardList, label: 'Postulaciones' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isDirectorPanel = user?.role === 'admin' || user?.role === 'director';
  const links = isDirectorPanel
    ? [...baseLinks.slice(0, 5), ...directorLinks, ...baseLinks.slice(5)]
    : baseLinks.filter((l) => l.to !== '/admin/sales' && l.to !== '/admin/users');

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen flex bg-[#1A1A1A]">
      <aside className="w-64 bg-[#111] border-r border-[#333] flex flex-col">
        <div className="p-6 border-b border-[#333]">
          <Link to="/" className="font-display text-xl tracking-widest text-[#FFF8F0]">
            RITMO<span className="text-[#FF6B1A]">FLOW</span>
          </Link>
          <p className="text-xs text-gray-500 mt-1 capitalize">{user?.role}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((l) => {
            const active = isActive(l.to, l.exact);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                  active
                    ? 'bg-[#FF6B1A] text-white'
                    : 'text-gray-400 hover:bg-[#242424] hover:text-white'
                }`}
              >
                <l.icon className="w-4 h-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#333] space-y-2">
          <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
            Mi perfil
          </Link>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
