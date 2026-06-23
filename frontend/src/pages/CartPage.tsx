import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Lock, Video } from 'lucide-react';
import Navbar from '../components/Navbar';
import { cartApi, salesApi } from '../services/api';
import type { Cart } from '../types';
import { GENRE_LABELS, formatPrice } from '../types';

const THUMB_COLORS = ['#FF6B1A', '#E91E8C'];

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = () => cartApi.get().then((r) => setCart(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleRemove = async (id: number) => {
    await cartApi.remove(id);
    load();
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await salesApi.checkout({
        payment_method: paymentMethod,
        billing_name: user.full_name || `${user.first_name} ${user.last_name}`,
        billing_email: user.email,
        billing_phone: user.phone || '',
      });
      alert('¡Compra realizada con éxito!');
      navigate('/dashboard');
    } catch {
      alert('Error al procesar la compra');
    } finally {
      setLoading(false);
    }
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
            <p className="text-xl text-gray-400">Tu carrito está vacío</p>
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
                    <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-light p-6 h-fit">
              <h2 className="font-display text-xl tracking-wide mb-4">RESUMEN DE COMPRA</h2>
              <div className="space-y-2 text-sm text-gray-400 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (19%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>
              <div className="border-t border-[#333] pt-4 flex justify-between items-center mb-6">
                <span className="font-semibold">Total</span>
                <span className="font-display text-3xl text-[#FF6B1A]">{formatPrice(total)}</span>
              </div>

              <p className="text-sm text-gray-400 mb-2">Método de pago</p>
              <div className="flex gap-2 mb-6">
                {['card', 'pse'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`flex-1 py-3 rounded-xl text-sm transition-all ${
                      paymentMethod === m
                        ? 'bg-gradient-to-r from-[#FF6B1A] to-[#E91E8C] text-white'
                        : 'bg-[#111] border border-[#333] text-gray-400 hover:border-[#FF6B1A]'
                    }`}
                  >
                    {m === 'card' ? 'Tarjeta' : 'PSE'}
                  </button>
                ))}
              </div>

              <button onClick={handleCheckout} disabled={loading} className="gradient-btn w-full py-4">
                {loading ? 'Procesando...' : 'Proceder al pago'}
              </button>
              <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Pago seguro (simulado)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
