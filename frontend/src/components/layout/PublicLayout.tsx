import { Link } from 'react-router-dom';
import { Music2, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0a1a]/90 backdrop-blur-md border-b border-[#2d1f42]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Music2 className="w-8 h-8 text-violet-400" />
            <span className="font-display text-xl font-bold gradient-text">Dance Academy</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#inicio" className="text-gray-300 hover:text-white transition-colors">Inicio</a>
            <a href="#clases" className="text-gray-300 hover:text-white transition-colors">Clases</a>
            <a href="#estilos" className="text-gray-300 hover:text-white transition-colors">Estilos</a>
            <a href="#contacto" className="text-gray-300 hover:text-white transition-colors">Contacto</a>
            <Link to="/login" className="btn-secondary text-sm">Iniciar sesión</Link>
            <Link to="/register" className="btn-primary text-sm">Registrarse</Link>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 pb-4 space-y-3 border-t border-[#2d1f42] pt-4">
            <a href="#inicio" className="block text-gray-300" onClick={() => setMenuOpen(false)}>Inicio</a>
            <a href="#clases" className="block text-gray-300" onClick={() => setMenuOpen(false)}>Clases</a>
            <a href="#estilos" className="block text-gray-300" onClick={() => setMenuOpen(false)}>Estilos</a>
            <Link to="/login" className="block btn-secondary text-center text-sm" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
            <Link to="/register" className="block btn-primary text-center text-sm" onClick={() => setMenuOpen(false)}>Registrarse</Link>
          </div>
        )}
      </nav>
      {children}
    </div>
  );
}
