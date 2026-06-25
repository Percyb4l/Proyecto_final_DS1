/**
 * Checkout en 4 pasos: ítems → datos personales → pago → confirmación.
 * Llama a POST /sales/checkout/ y muestra enlaces a videos comprados.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Lock, Video } from 'lucide-react';
import Navbar from '../components/Navbar';
import { authApi, cartApi, salesApi } from '../services/api';
import type { Cart, User } from '../types';
import { GENRE_LABELS, formatPrice } from '../types';

const STEPS = ['Ítems', 'Datos personales', 'Pago', 'Confirmación'];
const THUMB_COLORS = ['#FF6B1A', '#E91E8C'];

interface CheckoutResult {
  total: number;
  subtotal: number;
  tax: number;
  purchases: { id: number; title: string; choreography_id: number }[];
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [cart, setCart] = useState<Cart | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    billing_address: '', city: '', department: '', country: 'Colombia',
  });

  useEffect(() => {
    cartApi.get().then((r) => {
      if (!r.data.items.length) navigate('/cart');
      setCart(r.data);
    }).catch(() => navigate('/cart'));
    authApi.me().then((r) => {
      setUser(r.data);
      setForm({
        first_name: r.data.first_name || '',
        last_name: r.data.last_name || '',
        email: r.data.email || '',
        phone: r.data.phone || '',
        billing_address: r.data.billing_address || '',
        city: r.data.city || '',
        department: r.data.department || '',
        country: r.data.country || 'Colombia',
      });
    }).catch(() => {});
  }, [navigate]);

  const subtotal = cart?.total || 0;
  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  /** Procesa el pago simulado y avanza al paso de confirmación. */
  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await salesApi.checkout({
        payment_method: paymentMethod,
        billing_name: `${form.first_name} ${form.last_name}`.trim(),
        billing_email: form.email,
        billing_phone: form.phone,
        billing_address: form.billing_address,
        city: form.city,
        department: form.department,
        country: form.country,
        first_name: form.first_name,
        last_name: form.last_name,
      });
      setResult(res.data);
      setStep(3);
      const updated = { ...user, ...form, full_name: `${form.first_name} ${form.last_name}`.trim() };
      localStorage.setItem('user', JSON.stringify(updated));
    } catch {
      alert('Error al procesar la compra');
    } finally {
      setLoading(false);
    }
  };

  if (!cart) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <Navbar /><p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Navbar />
      <div className="pt-24 px-6 pb-20 max-w-4xl mx-auto">
        <h1 className="font-display text-4xl tracking-wide mb-8">FINALIZAR COMPRA</h1>

        <div className="flex flex-wrap gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                i === step ? 'bg-gradient-to-r from-[#FF6B1A] to-[#E91E8C] text-white' :
                i < step ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                'bg-[#242424] text-gray-500 border border-[#333]'
              }`}
            >
              {i < step ? <CheckCircle className="w-4 h-4" /> : <span>{i + 1}</span>}
              {label}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl mb-4">Confirma los ítems de tu compra</h2>
            {cart.items.map((item, i) => (
              <div key={item.id} className="card-light p-5 flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: THUMB_COLORS[i % 2] }}>
                  {item.choreography.thumbnail_emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.choreography.title}</h3>
                  <p className="text-sm text-gray-400">{GENRE_LABELS[item.choreography.genre]} · {item.choreography.video_count} videos</p>
                </div>
                <span className="font-display text-xl text-[#FF6B1A]">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
            <div className="card-light p-5 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-gray-400"><span>IVA (19%)</span><span>{formatPrice(tax)}</span></div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-[#333]">
                <span>Total</span><span className="text-[#FF6B1A]">{formatPrice(total)}</span>
              </div>
            </div>
            <button type="button" onClick={() => setStep(1)} className="gradient-btn w-full py-4">Continuar</button>
          </div>
        )}

        {step === 1 && (
          <div className="card-light p-6 space-y-4">
            <h2 className="font-display text-2xl mb-2">Datos personales</h2>
            <p className="text-sm text-gray-400 mb-4">Puedes actualizar tu información antes de pagar.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <input className="input-field" placeholder="Nombre" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
              <input className="input-field" placeholder="Apellido" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
              <input type="email" className="input-field md:col-span-2" placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <input className="input-field" placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="input-field md:col-span-2" placeholder="Dirección de facturación" value={form.billing_address} onChange={(e) => setForm({ ...form, billing_address: e.target.value })} />
              <input className="input-field" placeholder="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <input className="input-field" placeholder="Departamento" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              <input className="input-field md:col-span-2" placeholder="País" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl border border-[#333] text-gray-400">Atrás</button>
              <button type="button" onClick={() => setStep(2)} className="gradient-btn flex-1 py-3">Continuar</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card-light p-6">
            <h2 className="font-display text-2xl mb-4">Facturación y forma de pago</h2>
            <p className="text-sm text-gray-400 mb-2">Total a pagar: <span className="text-[#FF6B1A] font-display text-2xl">{formatPrice(total)}</span></p>
            <div className="flex gap-2 mb-6">
              {['card', 'pse'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`flex-1 py-3 rounded-xl text-sm ${paymentMethod === m ? 'bg-gradient-to-r from-[#FF6B1A] to-[#E91E8C] text-white' : 'bg-[#111] border border-[#333] text-gray-400'}`}
                >
                  {m === 'card' ? 'Tarjeta de crédito' : 'PSE'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-6 flex items-center gap-1"><Lock className="w-3 h-3" /> Pago simulado — no se realizará un cargo real.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-[#333] text-gray-400">Atrás</button>
              <button type="button" onClick={handleCheckout} disabled={loading} className="gradient-btn flex-1 py-3">
                {loading ? 'Procesando...' : 'Confirmar pago'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div className="card-light p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="font-display text-3xl mb-2">¡Compra realizada!</h2>
            <p className="text-gray-400 mb-6">Total pagado: {formatPrice(result.total)}</p>
            <h3 className="font-display text-xl mb-4 text-left">Tus coreografías compradas</h3>
            <div className="space-y-3 mb-8">
              {result.purchases.map((p) => (
                <Link
                  key={p.id}
                  to={`/my-choreographies/${p.id}`}
                  className="flex items-center gap-3 p-4 rounded-xl border border-[#333] hover:border-[#FF6B1A] transition-colors text-left"
                >
                  <Video className="w-5 h-5 text-[#FF6B1A]" />
                  <span className="flex-1">{p.title}</span>
                  <span className="text-[#E91E8C] text-sm">Ver videos →</span>
                </Link>
              ))}
            </div>
            <Link to="/dashboard" className="gradient-btn inline-block px-8 py-3">Ir a mi dashboard</Link>
          </div>
        )}
      </div>
    </div>
  );
}
