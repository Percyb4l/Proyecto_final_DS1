import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { instructorsApi } from '../services/api';
import type { Instructor } from '../types';
import { useAuth } from '../context/AuthContext';

export default function InstructorsPage() {
  const { isAdmin } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Instructor | null>(null);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', documentId: '', phone: '', specialty: '', bio: '' });

  const load = () => instructorsApi.getAll().then((r) => setInstructors(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ email: '', password: '', firstName: '', lastName: '', documentId: '', phone: '', specialty: '', bio: '' });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await instructorsApi.update(editing.id, { firstName: form.firstName, lastName: form.lastName, phone: form.phone, specialty: form.specialty, bio: form.bio });
      } else {
        await instructorsApi.create(form);
      }
      resetForm();
      load();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      alert(axiosErr.response?.data?.error || 'Error al guardar');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-bold">Instructores</h1>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nuevo instructor
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="card p-6 mb-6">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold">{editing ? 'Editar' : 'Nuevo'} instructor</h2>
            <button onClick={resetForm}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            {!editing && (
              <>
                <input className="input-field" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <input className="input-field" placeholder="Contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </>
            )}
            <input className="input-field" placeholder="Nombre" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <input className="input-field" placeholder="Apellido" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            <input className="input-field" placeholder="Documento" value={form.documentId} onChange={(e) => setForm({ ...form, documentId: e.target.value })} required disabled={!!editing} />
            <input className="input-field" placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input-field" placeholder="Especialidad" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
            <textarea className="input-field md:col-span-2" placeholder="Biografía" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            <div className="md:col-span-2"><button type="submit" className="btn-primary">{editing ? 'Actualizar' : 'Crear'}</button></div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {instructors.map((i) => (
          <div key={i.id} className="card p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="w-12 h-12 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-400 font-bold text-lg">
                {i.first_name[0]}{i.last_name[0]}
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(i); setForm({ email: i.email || '', password: '', firstName: i.first_name, lastName: i.last_name, documentId: i.document_id, phone: i.phone || '', specialty: i.specialty || '', bio: i.bio || '' }); setShowForm(true); }} className="text-violet-400"><Pencil className="w-4 h-4" /></button>
                  <button onClick={async () => { if (confirm('¿Eliminar?')) { await instructorsApi.delete(i.id); load(); } }} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-lg">{i.first_name} {i.last_name}</h3>
            <p className="text-violet-400 text-sm mb-2">{i.specialty}</p>
            <p className="text-gray-400 text-sm">{i.bio}</p>
            <p className="text-gray-500 text-xs mt-3">{i.phone} · {i.email}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
