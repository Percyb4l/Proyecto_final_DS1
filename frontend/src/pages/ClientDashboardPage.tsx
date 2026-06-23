import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { dashboardApi } from '../services/api';
import type { PurchaseAccess, Choreography } from '../types';
import { GENRE_LABELS, DIFFICULTY_LABELS, formatPrice } from '../types';

const THUMB_COLORS = ['#FF6B1A', '#E91E8C'];

export default function ClientDashboardPage() {
  const [greeting, setGreeting] = useState('');
  const [metrics, setMetrics] = useState({ purchases_count: 0, total_spent: 0 });
  const [purchases, setPurchases] = useState<PurchaseAccess[]>([]);
  const [recommended, setRecommended] = useState<Choreography[]>([]);

  useEffect(() => {
    dashboardApi.client().then((r) => {
      setGreeting(r.data.greeting);
      setMetrics(r.data.metrics);
      setPurchases(r.data.purchases);
      setRecommended(r.data.recommended);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Navbar />
      <div className="pt-24 px-6 pb-20 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="font-display text-5xl md:text-6xl tracking-wide mb-2">
            ¡HOLA, <span className="text-[#E91E8C]">{greeting?.toUpperCase()}!</span>
          </h1>
          <p className="text-xl text-gray-400">Bienvenido de nuevo a tu espacio de baile</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="card-light p-8">
            <p className="text-sm text-gray-400 mb-2">Coreografías compradas</p>
            <p className="font-display text-5xl text-[#FF6B1A]">{metrics.purchases_count}</p>
          </div>
          <div className="card-light p-8">
            <p className="text-sm text-gray-400 mb-2">Total invertido</p>
            <p className="font-display text-5xl text-[#FF6B1A]">{formatPrice(metrics.total_spent)}</p>
          </div>
        </div>

        <h2 className="font-display text-3xl tracking-wide mb-6">MIS COREOGRAFÍAS</h2>
        {purchases.length === 0 ? (
          <p className="text-gray-500 mb-12">
            Aún no has comprado coreografías. <Link to="/catalog" className="text-[#E91E8C] hover:underline">Explorar catálogo</Link>
          </p>
        ) : (
          <div className="space-y-4 mb-12">
            {purchases.map((p) => (
              <div key={p.id} className="card-light p-6 hover:border-[#FF6B1A]/50 transition-colors">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-[#FF6B1A]/30 to-[#E91E8C]/30 flex items-center justify-center text-4xl flex-shrink-0">
                    {p.choreography.thumbnail_emoji}
                  </div>
                  <div className="flex-1 w-full">
                    <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#E91E8C] text-white mb-2">
                      {GENRE_LABELS[p.choreography.genre]}
                    </span>
                    <h3 className="text-2xl font-semibold mb-1">{p.choreography.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">Prof. {p.choreography.professor_name}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {p.videos_watched} de {p.choreography.video_count} videos vistos
                        </span>
                        <span className="text-[#FF6B1A]">{p.progress_percent}%</span>
                      </div>
                      <div className="h-2 bg-[#111] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FF6B1A] to-[#E91E8C] transition-all"
                          style={{ width: `${p.progress_percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <button className="gradient-btn text-sm py-3 px-8 whitespace-nowrap">
                    {p.progress_percent === 100 ? 'Repetir' : 'Continuar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {recommended.length > 0 && (
          <>
            <h2 className="font-display text-3xl tracking-wide mb-6">RECOMENDADAS PARA TI</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {recommended.map((c, i) => (
                <div key={c.id} className="card-light overflow-hidden hover:border-[#FF6B1A]/50 transition-colors">
                  <div
                    className="h-32 flex items-center justify-center text-5xl"
                    style={{ backgroundColor: THUMB_COLORS[i % 2] }}
                  >
                    {c.thumbnail_emoji}
                  </div>
                  <div className="p-5">
                    <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#E91E8C] text-white mb-3">
                      {GENRE_LABELS[c.genre]} · {DIFFICULTY_LABELS[c.difficulty]}
                    </span>
                    <h3 className="text-xl mb-4">{c.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="font-display text-3xl text-[#FF6B1A]">{formatPrice(c.price)}</span>
                      <Link to="/catalog" className="bg-[#E91E8C] text-white text-sm px-6 py-2 rounded-full hover:opacity-90 transition-opacity">
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
