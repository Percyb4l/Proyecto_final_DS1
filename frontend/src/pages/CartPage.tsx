import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import { cartApi, salesApi } from '../services/api';
import type { Cart } from '../types';
import { GENRE_LABELS, formatPrice } from '../types';

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

  if (!cart) return <div className="min-h-screen flex items-center justify-center"><Navbar /><p className="text-gray-500">Cargando...</p></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 px-6 pb-20 max-w-5xl mx-auto">
        <h1 className="font-display text-4xl tracking-wide mb-8">MI CARRITO</h1>

        {cart.items.length === 0 ? (
          <p className="text-gray-500 text-center py-20">Tu carrito está vacío</p>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="card p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B1A]/20 to-[#E91E8C]/20 rounded-xl flex items-center justify-center text-3xl">
                    {item.choreography.thumbnail_emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.choreography.title}</h3>
                    <p className="text-sm text-[#E91E8C]">{GENRE_LABELS[item.choreography.genre]}</p>
                    <p className="text-xs text-gray-500">{item.choreography.video_count} clips</p>
                  </div>
                  <span className="price-orange">{formatPrice(item.subtotal)}</span>
                  <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>

            <div className="card p-6 h-fit">
              <h2 className="font-display text-xl tracking-wide mb-4">RESUMEN</h2>
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>{item.choreography.title}</span>
                  <span>{formatPrice(item.subtotal)}</span>
                </div>
              ))}
              <div className="border-t border-[#333] mt-4 pt-4 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="price-orange text-2xl">{formatPrice(cart.total)}</span>
              </div>

              <div className="mt-6 space-y-2">
                <p className="text-sm text-gray-400">Método de pago</p>
                <div className="flex gap-2">
                  {['card', 'pse'].map((m) => (
                    <button key={m} onClick={() => setPaymentMethod(m)}
                      className={`flex-1 py-2 rounded-xl text-sm border transition-colors ${
                        paymentMethod === m ? 'border-[#FF6B1A] text-[#FF6B1A] bg-[#FF6B1A]/10' : 'border-[#333] text-gray-400'
                      }`}>{m === 'card' ? 'Tarjeta' : 'PSE'}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleCheckout} disabled={loading} className="gradient-btn w-full mt-6">
                {loading ? 'Procesando...' : 'Finalizar compra'}
              </button>
              <p className="text-xs text-gray-600 text-center mt-3 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Pago seguro (simulado)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
