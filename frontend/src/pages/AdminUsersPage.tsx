import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { usersApi } from '../services/api';
import type { User } from '../types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
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
    load();
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
        <button onClick={() => setShowForm(!showForm)} className="gradient-btn flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Nuevo</button>
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
        <div className="card p-6 mb-6 grid md:grid-cols-2 gap-4">
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
          <button onClick={handleCreate} className="gradient-btn md:col-span-2">Crear usuario</button>
        </div>
      )}

      <div className="card overflow-x-auto">
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
                <td className="p-4">
                  <button onClick={() => handleDelete(u.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
