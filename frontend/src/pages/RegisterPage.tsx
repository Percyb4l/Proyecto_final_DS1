import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', documentId: '', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        documentId: form.documentId,
        phone: form.phone,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0f0a1a]">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Music2 className="w-10 h-10 text-violet-400" />
          </Link>
          <h1 className="font-display text-3xl font-bold gradient-text">Únete a nosotros</h1>
          <p className="text-gray-400 mt-2">Crea tu cuenta de estudiante</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Nombre</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Apellido</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} className="input-field" required />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Documento de identidad</label>
            <input name="documentId" value={form.documentId} onChange={handleChange} className="input-field" required />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Teléfono</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Correo electrónico</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Contraseña</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Confirmar</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="input-field" required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
