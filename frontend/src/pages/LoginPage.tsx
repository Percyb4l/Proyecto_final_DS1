import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
      const stored = localStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : null;
      navigate(user?.role === 'client' ? '/dashboard' : '/admin');
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md card p-8">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl tracking-widest">RITMO<span className="text-[#FF6B1A]">FLOW</span></Link>
          <h1 className="font-display text-2xl tracking-wide mt-4">BIENVENIDO</h1>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" className="input-field" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" className="input-field" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-[#E91E8C] hover:underline">¿Olvidaste tu contraseña?</Link>
          </div>

          <div className="flex items-center gap-3">
            {captchaImage && <img src={captchaImage} alt="CAPTCHA" className="h-12 rounded border border-[#333]" />}
            <input className="input-field flex-1" placeholder="CAPTCHA" value={captchaValue} onChange={(e) => setCaptchaValue(e.target.value)} required />
            <button type="button" onClick={loadCaptcha} className="text-[#FF6B1A] text-sm">↻</button>
          </div>

          <button type="submit" disabled={loading} className="gradient-btn w-full">{loading ? 'Ingresando...' : 'Iniciar sesión'}</button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta? <Link to="/register" className="text-[#E91E8C]">Regístrate</Link>
        </p>

        <div className="mt-6 pt-4 border-t border-[#333] text-xs text-gray-600 space-y-1">
          <p>admin@ritmoflow.com / admin123</p>
          <p>ana@ritmoflow.com / admin123 (Cliente)</p>
        </div>
      </div>
    </div>
  );
}
