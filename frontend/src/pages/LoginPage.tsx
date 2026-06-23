import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0f0a1a]">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #7c3aed 0%, transparent 70%)'
      }} />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Music2 className="w-10 h-10 text-violet-400" />
          </Link>
          <h1 className="font-display text-3xl font-bold gradient-text">Bienvenido</h1>
          <p className="text-gray-400 mt-2">Inicia sesión en Dance Academy</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <p className="text-center text-sm text-gray-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300">Regístrate</Link>
          </p>

          <div className="border-t border-[#2d1f42] pt-4 text-xs text-gray-500 space-y-1">
            <p className="font-medium text-gray-400">Usuarios de prueba:</p>
            <p>Admin: admin@danceacademy.com</p>
            <p>Instructor: carlos.instructor@danceacademy.com</p>
            <p>Estudiante: ana.estudiante@danceacademy.com</p>
            <p>Contraseña: admin123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
