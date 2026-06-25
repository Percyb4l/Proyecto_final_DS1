/**
 * Restablecimiento de contraseña con uid y token del enlace del correo.
 */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authApi.passwordResetConfirm({ uid, token, password, password_confirm: passwordConfirm });
      navigate('/login');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'No se pudo restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4">
        <div className="card-light p-8 text-center">
          <p className="text-red-400 mb-4">Enlace inválido</p>
          <Link to="/forgot-password" className="text-[#E91E8C] hover:underline">Solicitar nuevo enlace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4">
      <div className="w-full max-w-md card-light p-8">
        <h1 className="font-display text-3xl tracking-wide mb-6">NUEVA CONTRASEÑA</h1>
        {error && <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" className="input-field" placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <input type="password" className="input-field" placeholder="Confirmar contraseña" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required minLength={6} />
          <button type="submit" disabled={loading} className="gradient-btn w-full py-4">{loading ? 'Guardando...' : 'Restablecer contraseña'}</button>
        </form>
      </div>
    </div>
  );
}
