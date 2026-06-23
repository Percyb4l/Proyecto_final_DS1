import { Link } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111]/95 backdrop-blur border-b border-[#333]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl tracking-widest text-[#FFF8F0]">
          RITMO<span className="text-[#FF6B1A]">FLOW</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/catalog" className="text-sm text-gray-300 hover:text-white transition-colors">Catálogo</Link>
          {user ? (
            <>
              <Link to="/cart" className="text-gray-300 hover:text-white"><ShoppingCart className="w-5 h-5" /></Link>
              <Link to={user.role === 'client' ? '/dashboard' : '/admin'} className="text-gray-300 hover:text-white">
                <User className="w-5 h-5" />
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-300 hover:text-white">Iniciar sesión</Link>
              <Link to="/register" className="gradient-btn text-sm py-2 px-5">Unirme gratis</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
