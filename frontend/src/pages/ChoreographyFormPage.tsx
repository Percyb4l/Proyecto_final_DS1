/**
 * Formulario crear/editar coreografía con paquete de videos.
 */
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { choreoApi, usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GENRE_LABELS, DIFFICULTY_LABELS } from '../types';

interface VideoForm {
  part_number: number;
  title: string;
  video_url: string;
}

const emptyVideo = (n: number): VideoForm => ({
  part_number: n,
  title: `Parte ${n}`,
  video_url: '',
});

export default function ChoreographyFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { isProfessor } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', song_name: '', genre: 'salsa', difficulty: 'basic',
    description: '', price: '', thumbnail_emoji: '💃',
    guest_professor: '' as string | number, guest_professor_external: '',
  });
  const [professors, setProfessors] = useState<{ id: number; user: { id: number; full_name: string } }[]>([]);
  const [videos, setVideos] = useState<VideoForm[]>([emptyVideo(1), emptyVideo(2), emptyVideo(3), emptyVideo(4)]);

  useEffect(() => {
    usersApi.getProfessors().then((r) => setProfessors(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    choreoApi.getById(Number(id)).then((r) => {
      const c = r.data;
      setForm({
        title: c.title, song_name: c.song_name, genre: c.genre, difficulty: c.difficulty,
        description: c.description || '', price: String(c.price), thumbnail_emoji: c.thumbnail_emoji || '💃',
        guest_professor: c.guest_professor ?? '',
        guest_professor_external: c.guest_professor_external || '',
      });
      if (c.videos?.length) {
        setVideos(c.videos.map((v: { part_number: number; title: string; video_url: string }) => ({
          part_number: v.part_number,
          title: v.title,
          video_url: v.video_url,
        })));
      }
    }).catch(() => setError('No se pudo cargar la coreografía'));
  }, [id, isEdit]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = {
      ...form,
      price: Number(form.price),
      guest_professor: form.guest_professor ? Number(form.guest_professor) : null,
      guest_professor_external: form.guest_professor ? '' : form.guest_professor_external,
      videos: videos.filter((v) => v.title.trim()),
    };
    try {
      if (isEdit && id) {
        await choreoApi.update(Number(id), payload);
      } else {
        await choreoApi.create(payload);
      }
      navigate(isProfessor ? '/professor' : '/admin/choreographies');
    } catch {
      setError('Error al guardar la coreografía');
    } finally {
      setLoading(false);
    }
  };

  const backTo = isProfessor ? '/professor' : '/admin/choreographies';

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <Link to={backTo} className="text-sm text-gray-400 hover:text-[#FF6B1A] mb-4 inline-block">← Volver</Link>
        <h1 className="font-display text-3xl tracking-wide mb-6">
          {isEdit ? 'EDITAR COREOGRAFÍA' : 'NUEVA COREOGRAFÍA'}
        </h1>
        {error && <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="card-light p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input className="input-field md:col-span-2" placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input className="input-field md:col-span-2" placeholder="Nombre de la canción" value={form.song_name} onChange={(e) => setForm({ ...form, song_name: e.target.value })} required />
            <select className="input-field" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}>
              {Object.entries(GENRE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select className="input-field" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input className="input-field" placeholder="Precio (COP)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <input className="input-field" placeholder="Emoji" value={form.thumbnail_emoji} onChange={(e) => setForm({ ...form, thumbnail_emoji: e.target.value })} />
            <select
              className="input-field"
              value={form.guest_professor}
              onChange={(e) => setForm({
                ...form,
                guest_professor: e.target.value,
                guest_professor_external: e.target.value ? '' : form.guest_professor_external,
              })}
            >
              <option value="">Profesor invitado interno (opcional)</option>
              {professors.map((p) => (
                <option key={p.id} value={p.user.id}>{p.user.full_name}</option>
              ))}
            </select>
            <input
              className="input-field md:col-span-2"
              placeholder="Profesor invitado externo (opcional)"
              value={form.guest_professor_external}
              disabled={Boolean(form.guest_professor)}
              onChange={(e) => setForm({ ...form, guest_professor_external: e.target.value, guest_professor: '' })}
            />
            <textarea className="input-field md:col-span-2 min-h-[100px]" placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-display text-lg">Videos del paquete</h2>
              <button
                type="button"
                onClick={() => setVideos([...videos, emptyVideo(videos.length + 1)])}
                className="text-sm text-[#FF6B1A] flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Agregar video
              </button>
            </div>
            <div className="space-y-3">
              {videos.map((video, index) => (
                <div key={index} className="grid md:grid-cols-12 gap-2 items-center p-3 rounded-xl bg-[#111] border border-[#333]">
                  <span className="text-xs text-gray-500 md:col-span-1">#{video.part_number}</span>
                  <input className="input-field md:col-span-4" placeholder="Título del video" value={video.title} onChange={(e) => {
                    const next = [...videos];
                    next[index] = { ...video, title: e.target.value };
                    setVideos(next);
                  }} />
                  <input className="input-field md:col-span-6" placeholder="URL del video" value={video.video_url} onChange={(e) => {
                    const next = [...videos];
                    next[index] = { ...video, video_url: e.target.value };
                    setVideos(next);
                  }} />
                  {videos.length > 1 && (
                    <button type="button" onClick={() => setVideos(videos.filter((_, i) => i !== index))} className="text-red-400 md:col-span-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="gradient-btn w-full py-4">
            {loading ? 'Guardando...' : isEdit ? 'Actualizar coreografía' : 'Registrar coreografía'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
