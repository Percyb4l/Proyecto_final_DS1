import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { usersApi } from '../services/api';
import type { User } from '../types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', role: 'professor', document_number: '', phone: '', expertise: '', bio: '' });

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
    const payload = password ? { ...data, password } : data;
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
      document_number: user.document_number || '',
      phone: user.phone || '',
      expertise: '',
      bio: '',
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ email: '', password: '', first_name: '', last_name: '', role: 'professor', document_number: '', phone: '', expertise: '', bio: '' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar usuario?')) return;
    await usersApi.deleteInternal(id);
    load();
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl tracking-wide">USUARIOS INTERNOS</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="gradient-btn flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Nuevo</button>
      </div>

      <div className="flex gap-4 mb-6">
        <input className="input-field max-w-xs" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
        <select className="input-field w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="director">Director</option>
          <option value="professor">Profesor</option>
        </select>
      </div>

      {showForm && (
        <div className="card-light p-6 mb-6 grid md:grid-cols-2 gap-4">
          <h2 className="md:col-span-2 font-display text-xl">{editingId ? 'Editar usuario' : 'Nuevo usuario'}</h2>
          <input className="input-field" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input-field" placeholder="Contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input className="input-field" placeholder="Nombre" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <input className="input-field" placeholder="Apellido" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="admin">Administrador</option>
            <option value="director">Director</option>
            <option value="professor">Profesor</option>
          </select>
          <input className="input-field" placeholder="Documento" value={form.document_number} onChange={(e) => setForm({ ...form, document_number: e.target.value })} />
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
              <th className="p-4">Nombre</th><th className="p-4">Email</th><th className="p-4">Rol</th><th className="p-4">Documento</th><th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[#333]/50">
                <td className="p-4">{u.full_name}</td>
                <td className="p-4 text-gray-400">{u.email}</td>
                <td className="p-4 capitalize text-[#E91E8C]">{u.role}</td>
                <td className="p-4">{u.document_number}</td>
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
