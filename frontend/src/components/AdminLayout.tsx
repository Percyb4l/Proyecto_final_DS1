import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Music, ShoppingBag, GraduationCap, LogOut } from 'lucide-react';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Usuarios' },
  { to: '/admin/choreographies', icon: Music, label: 'Coreografías' },
  { to: '/admin/sales', icon: ShoppingBag, label: 'Ventas' },
  { to: '/admin/professors', icon: GraduationCap, label: 'Profesores' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-[#1A1A1A] border-r border-[#333] flex flex-col">
        <div className="p-6 border-b border-[#333]">
          <Link to="/" className="font-display text-xl tracking-widest">RITMO<span className="text-[#FF6B1A]">FLOW</span></Link>
          <p className="text-xs text-gray-500 mt-1 capitalize">{user?.role}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-[#FF6B1A] hover:bg-[#FF6B1A]/10 transition-colors">
              <l.icon className="w-4 h-4" />{l.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[#333]">
          <button onClick={logout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
