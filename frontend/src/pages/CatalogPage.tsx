/**
 * Catálogo público de coreografías.
 * Filtros por género/nivel, búsqueda, ordenamiento y agregar al carrito.
 */
import { useEffect, useState } from 'react';
import { Search, ShoppingCart, Video, ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import { choreoApi, cartApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Choreography } from '../types';
import { GENRE_LABELS, DIFFICULTY_LABELS, formatPrice } from '../types';

const FILTERS = [
  { key: 'all', label: 'Todos' }, { key: 'salsa', label: 'Salsa' }, { key: 'bachata', label: 'Bachata' },
  { key: 'hip_hop', label: 'Hip-Hop' }, { key: 'merengue', label: 'Merengue' }, { key: 'pop', label: 'Pop' },
  { key: 'basic', label: 'Nivel Básico' }, { key: 'intermediate', label: 'Intermedio' }, { key: 'advanced', label: 'Avanzado' },
];

const THUMB_COLORS = ['#FF6B1A', '#E91E8C'];

export default function CatalogPage() {
  const { user } = useAuth();
  const [choreos, setChoreos] = useState<Choreography[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');

  const load = () => {
    const params: Record<string, string> = { sort };
    if (search) params.search = search;
    if (['salsa','bachata','hip_hop','merengue','pop','reggaeton'].includes(activeFilter)) params.genre = activeFilter;
    if (['basic','intermediate','advanced'].includes(activeFilter)) params.difficulty = activeFilter;
    choreoApi.getAll(params).then((r) => setChoreos(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [activeFilter, sort]);

  const handleAdd = async (id: number) => {
    if (!user) { window.location.href = '/login'; return; }
    try {
      await cartApi.add(id);
      alert('¡Agregado al carrito!');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      alert(err.response?.data?.error || 'Error al agregar');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Navbar />
      <div className="pt-24 px-6 pb-20 max-w-7xl mx-auto">
        <h1 className="font-display text-5xl tracking-wide mb-8">CATÁLOGO DE COREOGRAFÍAS</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              className="input-field pl-12 bg-[#242424]"
              placeholder="Buscar coreografías..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </div>
          <div className="relative">
            <select
              className="input-field w-full md:w-auto appearance-none pr-12 bg-[#242424] cursor-pointer"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="popular">Más populares</option>
              <option value="newest">Más recientes</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm transition-all ${
                activeFilter === f.key
                  ? 'bg-gradient-to-r from-[#FF6B1A] to-[#E91E8C] text-white'
                  : 'bg-[#242424] border border-[#333] text-gray-300 hover:border-[#FF6B1A]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {choreos.map((c, i) => (
            <div key={c.id} className="card-light overflow-hidden hover:border-[#FF6B1A] transition-colors">
              <div
                className="h-40 flex items-center justify-center text-6xl"
                style={{ backgroundColor: THUMB_COLORS[i % 2] }}
              >
                {c.thumbnail_emoji}
              </div>
              <div className="p-5">
                <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#E91E8C] text-white mb-3">
                  {GENRE_LABELS[c.genre]} · {DIFFICULTY_LABELS[c.difficulty]}
                </span>
                <h3 className="text-xl font-semibold mb-2">{c.title}</h3>
                <p className="text-sm text-gray-400 mb-3">Prof. {c.professor_name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <Video className="w-4 h-4" />
                  <span>{c.video_count} videos</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-display text-3xl text-[#FF6B1A]">{formatPrice(c.price)}</span>
                  <button
                    onClick={() => handleAdd(c.id)}
                    className="bg-[#E91E8C] hover:opacity-90 text-white text-sm px-6 py-2 rounded-full flex items-center gap-1 transition-opacity"
                  >
                    <ShoppingCart className="w-3 h-3" /> Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
