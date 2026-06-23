import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { classesApi, catalogApi } from '../services/api';
import type { DanceClass, DanceStyle, Classroom, Instructor } from '../types';
import { instructorsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function ClassesPage() {
  const { isAdmin, isStudent } = useAuth();
  const [classes, setClasses] = useState<DanceClass[]>([]);
  const [styles, setStyles] = useState<DanceStyle[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DanceClass | null>(null);
  const [form, setForm] = useState({
    name: '', danceStyleId: '', instructorId: '', classroomId: '',
    dayOfWeek: '1', startTime: '18:00', endTime: '19:30',
    maxStudents: '20', monthlyFee: '', description: '',
  });

  const load = () => classesApi.getAll().then((r) => setClasses(r.data)).catch(() => {});

  useEffect(() => {
    load();
    catalogApi.getDanceStyles().then((r) => setStyles(r.data)).catch(() => {});
    instructorsApi.getAll().then((r) => setInstructors(r.data)).catch(() => {});
    catalogApi.getClassrooms().then((r) => setClassrooms(r.data)).catch(() => {});
  }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  const resetForm = () => {
    setForm({ name: '', danceStyleId: '', instructorId: '', classroomId: '', dayOfWeek: '1', startTime: '18:00', endTime: '19:30', maxStudents: '20', monthlyFee: '', description: '' });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name, danceStyleId: parseInt(form.danceStyleId), instructorId: parseInt(form.instructorId),
      classroomId: parseInt(form.classroomId), dayOfWeek: parseInt(form.dayOfWeek),
      startTime: form.startTime, endTime: form.endTime, maxStudents: parseInt(form.maxStudents),
      monthlyFee: parseFloat(form.monthlyFee), description: form.description,
    };
    try {
      if (editing) await classesApi.update(editing.id, data);
      else await classesApi.create(data);
      resetForm();
      load();
    } catch {
      alert('Error al guardar clase');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-bold">{isStudent ? 'Clases disponibles' : 'Clases'}</h1>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nueva clase
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="card p-6 mb-6">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold">{editing ? 'Editar clase' : 'Nueva clase'}</h2>
            <button onClick={resetForm}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <input className="input-field" placeholder="Nombre de la clase" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <select className="input-field" value={form.danceStyleId} onChange={(e) => setForm({ ...form, danceStyleId: e.target.value })} required>
              <option value="">Estilo de baile</option>
              {styles.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select className="input-field" value={form.instructorId} onChange={(e) => setForm({ ...form, instructorId: e.target.value })} required>
              <option value="">Instructor</option>
              {instructors.map((i) => <option key={i.id} value={i.id}>{i.first_name} {i.last_name}</option>)}
            </select>
            <select className="input-field" value={form.classroomId} onChange={(e) => setForm({ ...form, classroomId: e.target.value })} required>
              <option value="">Salón</option>
              {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="input-field" value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}>
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
            <input className="input-field" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            <input className="input-field" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            <input className="input-field" type="number" placeholder="Cupos máximos" value={form.maxStudents} onChange={(e) => setForm({ ...form, maxStudents: e.target.value })} />
            <input className="input-field" type="number" placeholder="Tarifa mensual" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })} required />
            <textarea className="input-field md:col-span-2" placeholder="Descripción" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="md:col-span-2"><button type="submit" className="btn-primary">{editing ? 'Actualizar' : 'Crear'}</button></div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <div key={cls.id} className="card p-6">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs px-3 py-1 rounded-full bg-violet-600/20 text-violet-300">{cls.dance_style}</span>
              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => {
                    setEditing(cls);
                    setForm({
                      name: cls.name, danceStyleId: String(cls.dance_style_id || ''), instructorId: String(cls.instructor_id || ''),
                      classroomId: String(cls.classroom_id || ''), dayOfWeek: String(cls.day_of_week),
                      startTime: cls.start_time?.slice(0, 5) || '', endTime: cls.end_time?.slice(0, 5) || '',
                      maxStudents: String(cls.max_students), monthlyFee: String(cls.monthly_fee), description: cls.description || '',
                    });
                    setShowForm(true);
                  }} className="text-violet-400"><Pencil className="w-4 h-4" /></button>
                  <button onClick={async () => { if (confirm('¿Desactivar clase?')) { await classesApi.delete(cls.id); load(); } }} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-lg mb-1">{cls.name}</h3>
            <p className="text-amber-400 font-semibold mb-3">{formatCurrency(cls.monthly_fee)}/mes</p>
            <div className="space-y-1 text-sm text-gray-400">
              <p>👤 {cls.instructor_name}</p>
              <p>📅 {cls.day_name} · {cls.start_time?.slice(0, 5)} - {cls.end_time?.slice(0, 5)}</p>
              <p>🏠 {cls.classroom_name}</p>
              <p>👥 {cls.enrolled_count || 0}/{cls.max_students} inscritos</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
