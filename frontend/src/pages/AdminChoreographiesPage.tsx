import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Plus, Pencil } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { choreoApi } from '../services/api';
import type { Choreography } from '../types';
import { GENRE_LABELS, DIFFICULTY_LABELS, formatPrice } from '../types';

export default function AdminChoreographiesPage() {
  const [choreos, setChoreos] = useState<Choreography[]>([]);
  const [genreFilter, setGenreFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    const params: Record<string, string> = {};
    if (genreFilter) params.genre = genreFilter;
    choreoApi.getAll(params).then((r) => {
      let data = r.data;
      if (statusFilter) data = data.filter((c: Choreography) => c.status === statusFilter);
      setChoreos(data);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, [genreFilter, statusFilter]);

  const handleApprove = async (id: number) => {
    await choreoApi.approve(id);
    load();
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl tracking-wide">COREOGRAFÍAS</h1>
        <Link to="/admin/choreographies/new" className="gradient-btn flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Nueva</Link>
      </div>

      <div className="flex gap-4 mb-6">
        <select className="input-field w-auto" value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
          <option value="">Todos los géneros</option>
          {Object.entries(GENRE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="input-field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="published">Publicada</option>
          <option value="pending">Pendiente</option>
          <option value="draft">Borrador</option>
        </select>
      </div>

      <div className="card-light overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#333] text-left text-xs text-gray-500 uppercase">
              <th className="p-4">Título</th><th className="p-4">Género</th><th className="p-4">Nivel</th>
              <th className="p-4">Profesor</th><th className="p-4">Precio</th><th className="p-4">Ventas</th>
              <th className="p-4">Estado</th><th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {choreos.map((c) => (
              <tr key={c.id} className="border-b border-[#333]/50">
                <td className="p-4 font-medium">{c.thumbnail_emoji} {c.title}</td>
                <td className="p-4 text-[#E91E8C]">{GENRE_LABELS[c.genre]}</td>
                <td className="p-4">{DIFFICULTY_LABELS[c.difficulty]}</td>
                <td className="p-4">{c.professor_name}</td>
                <td className="p-4 text-[#FF6B1A]">{formatPrice(c.price)}</td>
                <td className="p-4">{c.sales_count}</td>
                <td className="p-4 capitalize">{c.status}</td>
                <td className="p-4 flex gap-3 items-center">
                  <Link to={`/admin/choreographies/${c.id}/edit`} className="text-[#FF6B1A]"><Pencil className="w-4 h-4" /></Link>
                  {c.status === 'pending' && (
                    <button type="button" onClick={() => handleApprove(c.id)} className="text-green-400 flex items-center gap-1 text-sm">
                      <CheckCircle className="w-4 h-4" /> Aprobar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
