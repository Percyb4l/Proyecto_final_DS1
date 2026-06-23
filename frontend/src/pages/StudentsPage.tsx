import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { studentsApi } from '../services/api';
import type { Student } from '../types';
import { useAuth } from '../context/AuthContext';

export default function StudentsPage() {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', documentId: '', phone: '', birthDate: '', address: '', emergencyContact: '' });

  const load = () => studentsApi.getAll().then((r) => setStudents(r.data)).catch(() => {});

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const resetForm = () => {
    setForm({ email: '', password: '', firstName: '', lastName: '', documentId: '', phone: '', birthDate: '', address: '', emergencyContact: '' });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (s: Student) => {
    setEditing(s);
    setForm({
      email: s.email || '', password: '', firstName: s.first_name, lastName: s.last_name,
      documentId: s.document_id, phone: s.phone || '', birthDate: s.birth_date || '',
      address: s.address || '', emergencyContact: s.emergency_contact || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await studentsApi.update(editing.id, {
          firstName: form.firstName, lastName: form.lastName, phone: form.phone,
          birthDate: form.birthDate || null, address: form.address, emergencyContact: form.emergencyContact,
        });
      } else {
        await studentsApi.create(form);
      }
      resetForm();
      load();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      alert(axiosErr.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este estudiante?')) return;
    await studentsApi.delete(id);
    load();
  };

  if (!isAdmin) return <DashboardLayout><p className="text-gray-400">No tienes permisos para ver esta sección.</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-bold">Estudiantes</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo estudiante
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">{editing ? 'Editar estudiante' : 'Nuevo estudiante'}</h2>
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
            <input className="input-field" placeholder="Fecha de nacimiento" type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
            <input className="input-field" placeholder="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <input className="input-field" placeholder="Contacto de emergencia" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
            <div className="md:col-span-2">
              <button type="submit" className="btn-primary">{editing ? 'Actualizar' : 'Crear'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2d1f42]">
              <th className="table-header">Nombre</th>
              <th className="table-header">Documento</th>
              <th className="table-header">Teléfono</th>
              <th className="table-header">Email</th>
              <th className="table-header">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-[#2d1f42]/50 hover:bg-white/2">
                <td className="table-cell font-medium">{s.first_name} {s.last_name}</td>
                <td className="table-cell">{s.document_id}</td>
                <td className="table-cell">{s.phone || '-'}</td>
                <td className="table-cell">{s.email}</td>
                <td className="table-cell">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(s)} className="text-violet-400 hover:text-violet-300"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
