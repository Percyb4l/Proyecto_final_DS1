import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { dashboardApi } from '../services/api';
import type { PurchaseAccess, Choreography } from '../types';
import { GENRE_LABELS, formatPrice } from '../types';

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
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 px-6 pb-20 max-w-5xl mx-auto">
        <h1 className="font-display text-5xl tracking-wide mb-2">
          ¡HOLA, <span className="text-[#E91E8C]">{greeting?.toUpperCase()}!</span>
        </h1>

        <div className="grid grid-cols-2 gap-4 my-8">
          <div className="card p-5">
            <p className="text-sm text-gray-500">Coreografías compradas</p>
            <p className="font-display text-4xl text-[#FF6B1A]">{metrics.purchases_count}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-gray-500">Total invertido</p>
            <p className="font-display text-4xl text-[#FF6B1A]">{formatPrice(metrics.total_spent)}</p>
          </div>
        </div>

        <h2 className="font-display text-2xl tracking-wide mb-4">MIS COREOGRAFÍAS</h2>
        {purchases.length === 0 ? (
          <p className="text-gray-500 mb-8">Aún no has comprado coreografías. <Link to="/catalog" className="text-[#E91E8C]">Explorar catálogo</Link></p>
        ) : (
          <div className="space-y-4 mb-12">
            {purchases.map((p) => (
              <div key={p.id} className="card p-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B1A]/20 to-[#E91E8C]/20 rounded-xl flex items-center justify-center text-2xl">
                  {p.choreography.thumbnail_emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{p.choreography.title}</h3>
                  <p className="text-sm text-[#E91E8C]">{GENRE_LABELS[p.choreography.genre]} · {p.choreography.professor_name}</p>
                  <div className="mt-2 h-2 bg-[#333] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#FF6B1A] to-[#E91E8C] rounded-full transition-all"
                      style={{ width: `${p.progress_percent}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{p.videos_watched}/{p.choreography.video_count} videos vistos</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {recommended.length > 0 && (
          <>
            <h2 className="font-display text-2xl tracking-wide mb-4">RECOMENDADAS PARA TI</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {recommended.map((c) => (
                <div key={c.id} className="card p-4 flex items-center gap-4">
                  <span className="text-3xl">{c.thumbnail_emoji}</span>
                  <div>
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="price-orange">{formatPrice(c.price)}</p>
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
