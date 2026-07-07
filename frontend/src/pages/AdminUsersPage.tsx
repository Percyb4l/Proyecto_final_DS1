/**
 * Gestión CRUD de usuarios del sistema (admin, director, profesor y cliente).
 */
import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { usersApi } from '../services/api';
import type { User } from '../types';
import { ROLE_LABELS } from '../types';

const EMPTY_FORM = {
  email: '', password: '', first_name: '', last_name: '', role: 'professor',
  document_type: 'CC', document_number: '', gender: '', birth_date: '',
  phone: '', billing_address: '', city: '', department: '', country: 'Colombia',
  expertise: '', bio: '',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = () => {
    const params: Record<string, string> = {};
    if (roleFilter) params.role = roleFilter;
    if (search) params.search = search;
    usersApi.getInternal(params).then((r) => setUsers(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [roleFilter]);

  const handleCreate = async () => {
    await usersApi.createInternal(form);
    setShowForm(false);
    setEditingId(null);
    load();
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const { password, expertise, bio, ...data } = form;
    const payload: Record<string, string> = { ...data };
    if (password) payload.password = password;
    if (form.role === 'professor') {
      payload.expertise = expertise;
      payload.bio = bio;
    }
    await usersApi.updateInternal(editingId, payload);
    setShowForm(false);
    setEditingId(null);
    load();
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setShowForm(true);
    setForm({
      email: user.email,
      password: '',
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      document_type: user.document_type || 'CC',
      document_number: user.document_number || '',
      gender: user.gender || '',
      birth_date: user.birth_date || '',
      phone: user.phone || '',
      billing_address: user.billing_address || '',
      city: user.city || '',
      department: user.department || '',
      country: user.country || 'Colombia',
      expertise: user.expertise || '',
      bio: user.bio || '',
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar usuario?')) return;
    await usersApi.deleteInternal(id);
    load();
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl tracking-wide">GESTIÓN DE USUARIOS</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="gradient-btn flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Nuevo</button>
      </div>

      <div className="flex gap-4 mb-6">
        <input className="input-field max-w-xs" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
        <select className="input-field w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="director">Director</option>
          <option value="professor">Profesor</option>
          <option value="client">Cliente</option>
        </select>
      </div>

      {showForm && (
        <div className="card-light p-6 mb-6 grid md:grid-cols-2 gap-4">
          <h2 className="md:col-span-2 font-display text-xl">{editingId ? 'Editar usuario' : 'Nuevo usuario'}</h2>
          <input className="input-field" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input-field" placeholder={editingId ? 'Nueva contraseña (opcional)' : 'Contraseña'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input className="input-field" placeholder="Nombre" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <input className="input-field" placeholder="Apellido" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="admin">Administrador</option>
            <option value="director">Director</option>
            <option value="professor">Profesor</option>
            <option value="client">Cliente</option>
          </select>
          <select className="input-field" value={form.document_type} onChange={(e) => setForm({ ...form, document_type: e.target.value })}>
            <option value="CC">Cédula de ciudadanía</option>
            <option value="CE">Cédula de extranjería</option>
            <option value="TI">Tarjeta de identidad</option>
            <option value="PP">Pasaporte</option>
          </select>
          <input className="input-field" placeholder="Número de documento" value={form.document_number} onChange={(e) => setForm({ ...form, document_number: e.target.value })} />
          <select className="input-field" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="">Género (opcional)</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
          <input className="input-field" type="date" placeholder="Fecha de nacimiento" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
          <input className="input-field" placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input-field md:col-span-2" placeholder="Dirección" value={form.billing_address} onChange={(e) => setForm({ ...form, billing_address: e.target.value })} />
          <input className="input-field" placeholder="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="input-field" placeholder="Departamento" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <input className="input-field" placeholder="País" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          {form.role === 'professor' && (
            <>
              <input className="input-field" placeholder="Especialidad" value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} />
              <input className="input-field" placeholder="Biografía" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </>
          )}
          <button type="button" onClick={resetForm} className="py-3 rounded-xl border border-[#333] text-gray-400 md:col-span-1">Cancelar</button>
          <button type="button" onClick={editingId ? handleUpdate : handleCreate} className="gradient-btn md:col-span-1">
            {editingId ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      )}

      <div className="card-light overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#333] text-left text-xs text-gray-500 uppercase">
              <th className="p-4">Nombre</th><th className="p-4">Email</th><th className="p-4">Rol</th><th className="p-4">Documento</th><th className="p-4">Ciudad</th><th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[#333]/50">
                <td className="p-4">{u.full_name}</td>
                <td className="p-4 text-gray-400">{u.email}</td>
                <td className="p-4 text-[#E91E8C]">{ROLE_LABELS[u.role] || u.role}</td>
                <td className="p-4">{u.document_number}</td>
                <td className="p-4 text-gray-400">{u.city || '—'}</td>
                <td className="p-4 flex gap-3">
                  <button type="button" onClick={() => startEdit(u)} className="text-[#FF6B1A]"><Pencil className="w-4 h-4" /></button>
                  <button type="button" onClick={() => handleDelete(u.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
