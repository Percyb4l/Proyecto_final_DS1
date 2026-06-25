/**
 * Edición del perfil personal (todos los roles).
 * Usa AdminLayout para usuarios internos o Navbar para clientes.
 */
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AdminLayout from '../components/AdminLayout';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getAccountPath } from '../utils/auth';

const DOC_TYPES = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'TI', label: 'Tarjeta de identidad' },
  { value: 'PP', label: 'Pasaporte' },
];

export default function ProfilePage() {
  const { user, isInternal } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    document_type: 'CC', document_number: '', gender: '',
    birth_date: '', billing_address: '', city: '', department: '', country: 'Colombia',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authApi.me().then((r) => {
      setForm({
        first_name: r.data.first_name || '',
        last_name: r.data.last_name || '',
        email: r.data.email || '',
        phone: r.data.phone || '',
        document_type: r.data.document_type || 'CC',
        document_number: r.data.document_number || '',
        gender: r.data.gender || '',
        birth_date: r.data.birth_date || '',
        billing_address: r.data.billing_address || '',
        city: r.data.city || '',
        department: r.data.department || '',
        country: r.data.country || 'Colombia',
      });
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await authApi.updateMe(form);
      localStorage.setItem('user', JSON.stringify(res.data));
      setMessage('Perfil actualizado correctamente');
      setTimeout(() => navigate(getAccountPath(res.data.role)), 1200);
    } catch {
      setError('No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-4xl tracking-wide mb-2">MI PERFIL</h1>
      <p className="text-gray-400 mb-8">Actualiza tus datos personales.</p>
      {message && <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm mb-4">{message}</div>}
      {error && <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="card-light p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input className="input-field" placeholder="Nombre" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
          <input className="input-field" placeholder="Apellido" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
          <input type="email" className="input-field md:col-span-2" placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <select className="input-field" value={form.document_type} onChange={(e) => setForm({ ...form, document_type: e.target.value })}>
            {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <input className="input-field" placeholder="Nro. documento" value={form.document_number} onChange={(e) => setForm({ ...form, document_number: e.target.value })} />
          <select className="input-field" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="">Género</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
          <input type="date" className="input-field" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
          <input className="input-field md:col-span-2" placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input-field md:col-span-2" placeholder="Dirección de facturación" value={form.billing_address} onChange={(e) => setForm({ ...form, billing_address: e.target.value })} />
          <input className="input-field" placeholder="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="input-field" placeholder="Departamento" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <input className="input-field md:col-span-2" placeholder="País" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </div>
        <div className="flex gap-3 pt-2">
          <Link to={user ? getAccountPath(user.role) : '/'} className="flex-1 py-3 rounded-xl border border-[#333] text-center text-gray-400">Cancelar</Link>
          <button type="submit" disabled={loading} className="gradient-btn flex-1 py-3">{loading ? 'Guardando...' : 'Guardar cambios'}</button>
        </div>
      </form>
    </div>
  );

  if (isInternal) {
    return <AdminLayout>{content}</AdminLayout>;
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Navbar />
      <div className="pt-24 px-6 pb-20">{content}</div>
    </div>
  );
}
