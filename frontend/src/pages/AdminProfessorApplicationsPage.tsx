/**
 * Revisión de postulaciones de profesores para Admin/Director.
 */
import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { applicationsApi } from '../services/api';
import type { ProfessorApplication } from '../types';
import { APPLICATION_STATUS_LABELS } from '../types';

export default function AdminProfessorApplicationsPage() {
  const [applications, setApplications] = useState<ProfessorApplication[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selected, setSelected] = useState<ProfessorApplication | null>(null);
  const [password, setPassword] = useState('admin123');
  const [reviewNotes, setReviewNotes] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    applicationsApi.list(params).then((r) => setApplications(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [statusFilter]);

  const openReview = (app: ProfessorApplication) => {
    setSelected(app);
    setReviewNotes('');
    setPassword('admin123');
    setMessage('');
  };

  const handleApprove = async () => {
    if (!selected) return;
    setLoading(true);
    setMessage('');
    try {
      await applicationsApi.approve(selected.id, { password, review_notes: reviewNotes });
      setMessage('Postulación aprobada. El profesor ya puede iniciar sesión con su correo.');
      setSelected(null);
      load();
    } catch {
      setMessage('No se pudo aprobar la postulación.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    setLoading(true);
    setMessage('');
    try {
      await applicationsApi.reject(selected.id, { review_notes: reviewNotes });
      setMessage('Postulación rechazada.');
      setSelected(null);
      load();
    } catch {
      setMessage('No se pudo rechazar la postulación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-4xl tracking-wide mb-2">POSTULACIONES DE PROFESORES</h1>
      <p className="text-gray-400 mb-8">Revisa las solicitudes y aprueba o rechaza a los candidatos.</p>

      {message && (
        <div className="bg-[#242424] border border-[#333] text-[#FF6B1A] px-4 py-3 rounded-xl text-sm mb-6">
          {message}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <select className="input-field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobadas</option>
          <option value="rejected">Rechazadas</option>
          <option value="">Todas</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-light overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#333] text-left text-xs text-gray-500 uppercase">
                <th className="p-4">Candidato</th>
                <th className="p-4">Especialidad</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b border-[#333]/50 hover:bg-[#1A1A1A]">
                  <td className="p-4">
                    <p className="font-medium">{app.full_name}</p>
                    <p className="text-sm text-gray-400">{app.email}</p>
                  </td>
                  <td className="p-4 text-gray-400">{app.expertise}</td>
                  <td className="p-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      app.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400'
                        : app.status === 'approved' ? 'bg-green-900/30 text-green-400'
                          : 'bg-red-900/30 text-red-400'
                    }`}>
                      {APPLICATION_STATUS_LABELS[app.status]}
                    </span>
                  </td>
                  <td className="p-4">
                    <button type="button" onClick={() => openReview(app)} className="text-sm text-[#FF6B1A] hover:underline">
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No hay postulaciones en este filtro</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card-light p-6">
          {selected ? (
            <>
              <h2 className="font-display text-2xl mb-4">{selected.full_name}</h2>
              <div className="space-y-3 text-sm mb-6">
                <p><span className="text-gray-500">Email:</span> {selected.email}</p>
                <p><span className="text-gray-500">Teléfono:</span> {selected.phone || '—'}</p>
                <p><span className="text-gray-500">Documento:</span> {selected.document_number}</p>
                <p><span className="text-gray-500">Especialidad:</span> {selected.expertise}</p>
                <div>
                  <p className="text-gray-500 mb-1">Experiencia:</p>
                  <p className="text-gray-300 whitespace-pre-wrap">{selected.experience}</p>
                </div>
                {selected.bio && (
                  <div>
                    <p className="text-gray-500 mb-1">Biografía:</p>
                    <p className="text-gray-300 whitespace-pre-wrap">{selected.bio}</p>
                  </div>
                )}
                {selected.review_notes && (
                  <div>
                    <p className="text-gray-500 mb-1">Notas de revisión:</p>
                    <p className="text-gray-300">{selected.review_notes}</p>
                  </div>
                )}
              </div>

              {selected.status === 'pending' && (
                <>
                  <label className="block text-sm text-gray-400 mb-2">Contraseña inicial del profesor</label>
                  <input
                    className="input-field mb-4"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña temporal"
                  />
                  <label className="block text-sm text-gray-400 mb-2">Comentario (opcional)</label>
                  <textarea
                    className="input-field min-h-24 mb-6 resize-y"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Motivo de aprobación o rechazo..."
                  />
                  <div className="flex gap-3">
                    <button type="button" disabled={loading} onClick={handleApprove} className="gradient-btn flex-1 flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Aprobar
                    </button>
                    <button type="button" disabled={loading} onClick={handleReject} className="flex-1 py-3 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-900/20 flex items-center justify-center gap-2">
                      <X className="w-4 h-4" /> Rechazar
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center py-16">Selecciona una postulación para revisarla</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
