import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      const axiosErr = err as { response?: { data?: Record<string, string> } };
      const data = axiosErr.response?.data;
      setError(Object.values(data || {})[0] as string || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md card p-8">
        <div className="text-center mb-6">
          <Link to="/" className="font-display text-3xl tracking-widest">RITMO<span className="text-[#FF6B1A]">FLOW</span></Link>
          <h1 className="font-display text-2xl tracking-wide mt-4">CREAR CUENTA</h1>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" placeholder="Nombre" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <input className="input-field" placeholder="Apellido" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <input type="email" className="input-field" placeholder="Correo electrónico" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input-field" placeholder="Documento" value={form.document_number} onChange={(e) => setForm({ ...form, document_number: e.target.value })} required />
          <input className="input-field" placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input type="password" className="input-field" placeholder="Contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <input type="password" className="input-field" placeholder="Confirmar contraseña" value={form.password_confirm} onChange={(e) => setForm({ ...form, password_confirm: e.target.value })} required />
          <button type="submit" disabled={loading} className="gradient-btn w-full mt-2">{loading ? 'Registrando...' : 'Crear cuenta'}</button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta? <Link to="/login" className="text-[#E91E8C]">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
