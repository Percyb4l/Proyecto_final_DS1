/**
 * Página de inicio (landing).
 * Muestra hero, estadísticas de marca y coreografías destacadas del API.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import { choreoApi } from '../services/api';
import type { Choreography } from '../types';
import { GENRE_LABELS, formatPrice } from '../types';

export default function LandingPage() {
  const [featured, setFeatured] = useState<Choreography[]>([]);

  useEffect(() => {
    choreoApi.getFeatured().then((r) => setFeatured(r.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Navbar />
      <section className="pt-32 pb-16 px-6 text-center max-w-7xl mx-auto">
        <h1 className="font-display text-6xl md:text-7xl tracking-wide leading-none mb-6">
          APRENDE A BAILAR<br />
          <span className="text-[#FF6B1A]">CON LOS MEJORES</span>
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg md:text-xl">
          Descubre coreografías profesionales en salsa, bachata, hip-hop y más. Aprende a tu ritmo desde casa.
        </p>
        <div className="flex justify-center gap-4 mb-16">
          <Link to="/catalog" className="gradient-btn text-lg px-8 py-4">Ver catálogo</Link>
          <Link to="/register" className="border-2 border-[#FF6B1A] text-[#FF6B1A] rounded-full px-8 py-4 font-semibold hover:bg-[#FF6B1A] hover:text-white transition-colors">
            Unirme gratis
          </Link>
        </div>

        <div className="flex justify-center gap-12 py-8 border-t border-b border-[#333] max-w-2xl mx-auto">
          <div>
            <span className="font-display text-4xl text-[#FF6B1A]">120+</span>
            <p className="text-sm text-gray-400 mt-1">Coreografías</p>
          </div>
          <div>
            <span className="font-display text-4xl text-[#FF6B1A]">18</span>
            <p className="text-sm text-gray-400 mt-1">Profesores</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-4xl text-[#FF6B1A]">4.8</span>
            <Star className="w-5 h-5 text-[#FF6B1A] fill-[#FF6B1A]" />
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 max-w-7xl mx-auto">
        <h2 className="font-display text-3xl tracking-wide mb-8">COREOGRAFÍAS DESTACADAS</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((c) => (
            <Link
              key={c.id}
              to="/catalog"
              className="card-light overflow-hidden group hover:border-[#FF6B1A] transition-colors"
            >
              <div className="h-48 bg-gradient-to-br from-[#FF6B1A]/30 to-[#E91E8C]/30 flex items-center justify-center text-6xl relative">
                {c.thumbnail_emoji}
                <span className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full bg-[#E91E8C] text-white">
                  {GENRE_LABELS[c.genre] || c.genre}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">{c.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="price-orange">{formatPrice(c.price)}</span>
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-[#FF6B1A] text-[#FF6B1A]" />
                    {c.rating}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#333] py-8 text-center text-gray-500 text-sm bg-[#111]">
        © 2026 RITMOFLOW · Proyecto Final DS1 · Universidad del Valle
      </footer>
    </div>
  );
}
