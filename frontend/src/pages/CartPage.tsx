/**
 * Carrito de compras del cliente.
 * Lista ítems, calcula IVA 19% y redirige al checkout por pasos.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Video } from 'lucide-react';
import Navbar from '../components/Navbar';
import { cartApi } from '../services/api';
import type { Cart } from '../types';
import { GENRE_LABELS, formatPrice } from '../types';

const THUMB_COLORS = ['#FF6B1A', '#E91E8C'];

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const navigate = useNavigate();

  const load = () => cartApi.get().then((r) => setCart(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleRemove = async (id: number) => {
    await cartApi.remove(id);
    load();
  };

  const subtotal = cart?.total || 0;
  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  if (!cart) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <Navbar />
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Navbar />
      <div className="pt-24 px-6 pb-20 max-w-7xl mx-auto">
        <h1 className="font-display text-5xl tracking-wide mb-8">CARRITO DE COMPRAS</h1>

        {cart.items.length === 0 ? (
          <div className="card-light p-12 text-center">
            <p className="text-xl text-gray-400 mb-4">Tu carrito está vacío</p>
            <Link to="/catalog" className="text-[#E91E8C] hover:underline">Explorar catálogo</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item, i) => (
                <div key={item.id} className="card-light p-6 hover:border-[#FF6B1A]/50 transition-colors">
                  <div className="flex gap-6 items-center">
                    <div
                      className="w-24 h-24 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                      style={{ backgroundColor: THUMB_COLORS[i % 2] }}
                    >
                      {item.choreography.thumbnail_emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{item.choreography.title}</h3>
                      <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#E91E8C] text-white mb-2">
                        {GENRE_LABELS[item.choreography.genre]}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Video className="w-4 h-4" />
                        <span>{item.choreography.video_count} videos</span>
                      </div>
                    </div>
                    <span className="font-display text-2xl text-[#FF6B1A]">{formatPrice(item.subtotal)}</span>
                    <button type="button" onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-light p-6 h-fit">
              <h2 className="font-display text-xl tracking-wide mb-4">RESUMEN</h2>
              <div className="space-y-2 text-sm text-gray-400 mb-4">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span>IVA (19%)</span><span>{formatPrice(tax)}</span></div>
              </div>
              <div className="border-t border-[#333] pt-4 flex justify-between items-center mb-6">
                <span className="font-semibold">Total</span>
                <span className="font-display text-3xl text-[#FF6B1A]">{formatPrice(total)}</span>
              </div>
              <button type="button" onClick={() => navigate('/checkout')} className="gradient-btn w-full py-4">
                Proceder a facturación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
