/**
 * Barra de navegación principal.
 * Muestra enlaces según si el usuario está autenticado y su rol.
 */
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAccountPath } from '../utils/auth';

export default function Navbar() {
  const { user } = useAuth();
  const accountPath = user ? getAccountPath(user.role) : '/login';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111]/95 backdrop-blur border-b border-[#333]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl tracking-widest text-[#FFF8F0]">
          RITMO<span className="text-[#FF6B1A]">FLOW</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/catalog" className="text-sm text-[#FFF8F0] hover:text-[#FF6B1A] transition-colors">
            Catálogo
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="text-sm text-[#FFF8F0] hover:text-[#FF6B1A] transition-colors">
                Mi Perfil
              </Link>
              <Link to={accountPath} className="text-sm text-[#FFF8F0] hover:text-[#FF6B1A] transition-colors">
                Dashboard
              </Link>
              {user.role === 'client' && (
                <Link to="/cart" className="text-[#FFF8F0] hover:text-[#FF6B1A] transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-[#FFF8F0] hover:text-[#FF6B1A] transition-colors">
                Iniciar sesión
              </Link>
              <Link to="/register" className="gradient-btn text-sm py-2 px-5">
                Unirme gratis
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
