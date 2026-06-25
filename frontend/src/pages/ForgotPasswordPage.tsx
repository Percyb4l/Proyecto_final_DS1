import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await authApi.passwordResetRequest(email);
      setMessage(res.data.detail);
    } catch {
      setError('No se pudo procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4">
      <div className="w-full max-w-md card-light p-8">
        <h1 className="font-display text-3xl tracking-wide mb-2">RECUPERAR CLAVE</h1>
        <p className="text-gray-400 text-sm mb-6">Te enviaremos un enlace a tu correo electrónico.</p>
        {message && <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm mb-4">{message}</div>}
        {error && <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" className="input-field" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" disabled={loading} className="gradient-btn w-full py-4">{loading ? 'Enviando...' : 'Enviar enlace'}</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-[#E91E8C] hover:underline">Volver al login</Link>
        </p>
      </div>
    </div>
  );
}
