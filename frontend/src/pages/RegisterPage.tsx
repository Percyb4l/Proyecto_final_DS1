/**
 * Registro de nuevos clientes.
 * Crea cuenta vía API y redirige al dashboard del cliente.
 */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleButton, FacebookButton, AuthDivider } from '../components/SocialLogin';
import { formatApiError } from '../utils/apiError';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', password_confirm: '',
    document_type: 'CC', document_number: '', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) { setError('Las contraseñas no coinciden'); return; }
    setError('');
    setLoading(true);
    try {
      await register({
        first_name: form.firstName, last_name: form.lastName,
        email: form.email, password: form.password, password_confirm: form.password_confirm,
        document_type: form.document_type, document_number: form.document_number, phone: form.phone,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      setError(formatApiError(axiosErr.response?.data, 'Error al registrarse'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-4xl tracking-widest text-[#FFF8F0]">
            RITMO<span className="text-[#FF6B1A]">FLOW</span>
          </Link>
        </div>

        <div className="card-light p-8">
          <h1 className="font-display text-3xl tracking-wide mb-6">CREAR CUENTA</h1>

          <div className="space-y-3 mb-6">
            <GoogleButton />
            <FacebookButton />
          </div>
          <AuthDivider />

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Nombre</label>
                <input className="input-field" placeholder="Juan" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Apellido</label>
                <input className="input-field" placeholder="Pérez" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Correo electrónico</label>
              <input type="email" className="input-field" placeholder="tu@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Documento</label>
              <input className="input-field" placeholder="1234567890" value={form.document_number} onChange={(e) => setForm({ ...form, document_number: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Teléfono</label>
              <input className="input-field" placeholder="3001234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Contraseña</label>
              <input type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Confirmar contraseña</label>
              <input type="password" className="input-field" placeholder="••••••••" value={form.password_confirm} onChange={(e) => setForm({ ...form, password_confirm: e.target.value })} required />
            </div>

            <div className="bg-[#111] border border-[#333] rounded-xl p-4 flex items-center gap-3">
              <input type="checkbox" className="w-5 h-5" required />
              <span className="text-sm text-gray-400">No soy un robot</span>
            </div>

            <button type="submit" disabled={loading} className="gradient-btn w-full py-4">
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta? <Link to="/login" className="text-[#E91E8C] hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
