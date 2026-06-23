import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { enrollmentsApi, classesApi } from '../services/api';
import type { Enrollment, DanceClass } from '../types';
import { useAuth } from '../context/AuthContext';

export default function EnrollmentsPage() {
  const { isAdmin, isStudent } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [classes, setClasses] = useState<DanceClass[]>([]);
  const [selectedClass, setSelectedClass] = useState('');

  const load = () => enrollmentsApi.getAll().then((r) => setEnrollments(r.data)).catch(() => {});

  useEffect(() => {
    load();
    if (isStudent) classesApi.getAll().then((r) => setClasses(r.data)).catch(() => {});
  }, [isStudent]);

  const handleEnroll = async () => {
    if (!selectedClass) return;
    try {
      await enrollmentsApi.create({ classId: parseInt(selectedClass) });
      setSelectedClass('');
      load();
      alert('¡Inscripción exitosa!');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      alert(axiosErr.response?.data?.error || 'Error al inscribirse');
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400';
      case 'cancelled': return 'bg-red-500/10 text-red-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-bold">{isStudent ? 'Mis inscripciones' : 'Inscripciones'}</h1>
      </div>

      {isStudent && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-4">Inscribirse a una clase</h2>
          <div className="flex gap-4">
            <select className="input-field flex-1" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="">Seleccionar clase</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.dance_style} ({c.enrolled_count}/{c.max_students})
                </option>
              ))}
            </select>
            <button onClick={handleEnroll} className="btn-primary whitespace-nowrap">Inscribirme</button>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2d1f42]">
              <th className="table-header">Estudiante</th>
              <th className="table-header">Clase</th>
              <th className="table-header">Estilo</th>
              <th className="table-header">Fecha</th>
              <th className="table-header">Estado</th>
              {isAdmin && <th className="table-header">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.id} className="border-b border-[#2d1f42]/50">
                <td className="table-cell font-medium">{e.student_name}</td>
                <td className="table-cell">{e.class_name}</td>
                <td className="table-cell">{e.dance_style}</td>
                <td className="table-cell">{new Date(e.enrollment_date).toLocaleDateString('es-CO')}</td>
                <td className="table-cell">
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor(e.status)}`}>{e.status}</span>
                </td>
                {isAdmin && (
                  <td className="table-cell">
                    {e.status === 'active' && (
                      <button
                        onClick={async () => { await enrollmentsApi.updateStatus(e.id, 'cancelled'); load(); }}
                        className="text-red-400 text-sm hover:text-red-300"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {enrollments.length === 0 && <p className="text-center text-gray-500 py-8">No hay inscripciones</p>}
      </div>
    </DashboardLayout>
  );
}
