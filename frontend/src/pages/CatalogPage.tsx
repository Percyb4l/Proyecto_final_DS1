import { useEffect, useState } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
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
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 px-6 pb-20 max-w-7xl mx-auto">
        <h1 className="font-display text-4xl tracking-wide mb-6">CATÁLOGO</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input className="input-field pl-11" placeholder="Buscar coreografías..." value={search}
              onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
          </div>
          <select className="input-field w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="popular">Más populares</option>
            <option value="newest">Más recientes</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
          </select>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setActiveFilter(f.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm border transition-colors ${
                activeFilter === f.key ? 'bg-[#E91E8C] border-[#E91E8C] text-white' : 'border-[#333] text-gray-400 hover:border-[#E91E8C]'
              }`}>{f.label}</button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {choreos.map((c) => (
            <div key={c.id} className="card p-5 flex flex-col">
              <div className="h-32 bg-gradient-to-br from-[#FF6B1A]/10 to-[#E91E8C]/10 rounded-xl flex items-center justify-center text-5xl mb-4">
                {c.thumbnail_emoji}
              </div>
              <span className="tag-fuchsia w-fit mb-2">{GENRE_LABELS[c.genre]} · {DIFFICULTY_LABELS[c.difficulty]}</span>
              <h3 className="font-semibold text-lg mb-1">{c.title}</h3>
              <p className="text-sm text-gray-500 mb-1">{c.professor_name}</p>
              <p className="text-xs text-gray-600 mb-4">{c.video_count} videos</p>
              <div className="flex justify-between items-center mt-auto">
                <span className="price-orange">{formatPrice(c.price)}</span>
                <button onClick={() => handleAdd(c.id)} className="bg-[#E91E8C] hover:bg-[#E91E8C]/80 text-white text-sm px-4 py-2 rounded-full flex items-center gap-1 transition-colors">
                  <ShoppingCart className="w-3 h-3" /> Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
