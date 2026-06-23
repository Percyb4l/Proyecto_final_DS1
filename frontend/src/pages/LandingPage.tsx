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
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-16 px-6 text-center">
        <h1 className="font-display text-6xl md:text-8xl tracking-wide leading-none mb-4">
          APRENDE A BAILAR<br />
          <span className="text-[#FF6B1A]">CON LOS MEJORES</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto mb-8 text-lg">
          Descubre coreografías profesionales en salsa, bachata, hip-hop y más. Aprende a tu ritmo desde casa.
        </p>
        <div className="flex justify-center gap-4 mb-16">
          <Link to="/catalog" className="gradient-btn">Ver catálogo</Link>
          <Link to="/register" className="border border-[#FF6B1A] text-[#FF6B1A] rounded-full px-6 py-3 font-semibold hover:bg-[#FF6B1A]/10 transition-colors">
            Unirme gratis
          </Link>
        </div>
        <div className="flex justify-center gap-16 border-t border-[#333] pt-8 max-w-2xl mx-auto">
          <div><span className="font-display text-3xl text-[#FF6B1A]">120+</span><p className="text-sm text-gray-500">Coreografías</p></div>
          <div><span className="font-display text-3xl text-[#FF6B1A]">18</span><p className="text-sm text-gray-500">Profesores</p></div>
          <div className="flex items-center gap-1"><span className="font-display text-3xl text-[#FF6B1A]">4.8</span><Star className="w-5 h-5 text-[#FF6B1A] fill-[#FF6B1A]" /></div>
        </div>
      </section>

      <section className="px-6 pb-20 max-w-7xl mx-auto">
        <h2 className="font-display text-3xl tracking-wide mb-8">COREOGRAFÍAS DESTACADAS</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((c) => (
            <div key={c.id} className="card overflow-hidden group hover:border-[#FF6B1A]/50 transition-colors">
              <div className="h-40 bg-gradient-to-br from-[#FF6B1A]/20 to-[#E91E8C]/20 flex items-center justify-center text-6xl relative">
                {c.thumbnail_emoji}
                <span className="tag-fuchsia absolute top-3 right-3">{GENRE_LABELS[c.genre] || c.genre}</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">{c.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="price-orange">{formatPrice(c.price)}</span>
                  <span className="flex items-center gap-1 text-sm text-[#FF6B1A]">
                    <Star className="w-3 h-3 fill-[#FF6B1A]" />{c.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#333] py-8 text-center text-gray-500 text-sm">
        © 2026 RITMOFLOW · Proyecto Final DS1 · Universidad del Valle
      </footer>
    </div>
  );
}
