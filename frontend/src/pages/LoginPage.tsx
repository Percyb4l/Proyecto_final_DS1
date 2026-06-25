import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GoogleButton, AuthDivider } from '../components/SocialLogin';
import { getAccountPath } from '../utils/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const loadCaptcha = () => {
    authApi.getCaptcha().then((r) => {
      setCaptchaKey(r.data.captcha_key);
      setCaptchaImage(r.data.captcha_image);
      setCaptchaValue('');
    });
  };

  useEffect(() => { loadCaptcha(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password, captcha_key: captchaKey, captcha_value: captchaValue });
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      navigate(getAccountPath(user?.role));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string> } };
      const data = axiosErr.response?.data;
      setError(data?.detail || data?.captcha || 'Error al iniciar sesión');
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-4xl tracking-widest text-[#FFF8F0]">
            RITMO<span className="text-[#FF6B1A]">FLOW</span>
          </Link>
        </div>

        <div className="card-light p-8">
          <h1 className="font-display text-3xl tracking-wide mb-2">BIENVENIDO</h1>
          <p className="text-gray-400 mb-6">Inicia sesión para continuar</p>

          <GoogleButton />
          <AuthDivider />

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Correo electrónico</label>
              <input type="email" className="input-field" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Contraseña</label>
              <input type="password" className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-[#E91E8C] hover:underline">¿Olvidaste tu contraseña?</Link>
            </div>

            <div className="flex items-center gap-3">
              {captchaImage && <img src={captchaImage} alt="CAPTCHA" className="h-12 rounded border border-[#333]" />}
              <input className="input-field flex-1" placeholder="CAPTCHA" value={captchaValue} onChange={(e) => setCaptchaValue(e.target.value)} required />
              <button type="button" onClick={loadCaptcha} className="text-[#FF6B1A] text-sm px-2">↻</button>
            </div>

            <button type="submit" disabled={loading} className="gradient-btn w-full py-4">
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta? <Link to="/register" className="text-[#E91E8C] hover:underline">Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
