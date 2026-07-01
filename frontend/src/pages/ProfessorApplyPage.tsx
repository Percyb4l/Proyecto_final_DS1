/**
 * Formulario público para postularse como profesor bailarín.
 */
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import Navbar from '../components/Navbar';
import { applicationsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatApiError } from '../utils/apiError';

export default function ProfessorApplyPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    document_type: 'CC', document_number: '',
    expertise: '', experience: '', bio: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'client') {
      setForm((prev) => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        document_number: user.document_number || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await applicationsApi.submit(form);
      setSuccess('Tu postulación fue enviada. El director revisará tu solicitud y te contactará por correo.');
      setForm({
        first_name: '', last_name: '', email: '', phone: '',
        document_type: 'CC', document_number: '',
        expertise: '', experience: '', bio: '',
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      setError(formatApiError(axiosErr.response?.data, 'No se pudo enviar la postulación'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Navbar />
      <div className="pt-28 px-6 pb-20 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <GraduationCap className="w-12 h-12 text-[#FF6B1A] mx-auto mb-4" />
          <h1 className="font-display text-4xl tracking-wide mb-3">POSTÚLATE COMO PROFESOR</h1>
          <p className="text-gray-400">
            Comparte tu experiencia profesional. Un director revisará tu solicitud y te notificará la decisión.
          </p>
        </div>

        <div className="card-light p-8">
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input className="input-field" placeholder="Nombre" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
              <input className="input-field" placeholder="Apellido" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
            </div>
            <input type="email" className="input-field" placeholder="Correo electrónico" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required readOnly={user?.role === 'client'} />
            <input className="input-field" placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input-field" placeholder="Documento de identidad" value={form.document_number} onChange={(e) => setForm({ ...form, document_number: e.target.value })} required />
            <input className="input-field" placeholder="Especialidad (ej: Salsa, Bachata, Hip-Hop)" value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} required />
            <textarea
              className="input-field min-h-32 resize-y"
              placeholder="Cuéntanos tu experiencia como bailarín o instructor..."
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              required
            />
            <textarea
              className="input-field min-h-24 resize-y"
              placeholder="Biografía breve (opcional)"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
            <button type="submit" disabled={loading} className="gradient-btn w-full py-4">
              {loading ? 'Enviando...' : 'Enviar postulación'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya eres profesor? <Link to="/login" className="text-[#E91E8C] hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );

}
