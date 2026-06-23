import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { classesApi, attendanceApi } from '../services/api';
import type { DanceClass, AttendanceRecord } from '../types';

export default function AttendancePage() {
  const [classes, setClasses] = useState<DanceClass[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    classesApi.getAll().then((r) => setClasses(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedClass) {
      attendanceApi.getByClass(parseInt(selectedClass), date)
        .then((r) => setRecords(r.data))
        .catch(() => {});
    }
  }, [selectedClass, date]);

  const toggleStatus = (index: number) => {
    const updated = [...records];
    const current = updated[index].status;
    updated[index] = { ...updated[index], status: current === 'present' ? 'absent' : 'present' };
    setRecords(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await attendanceApi.recordBulk(
        records.map((r) => ({
          enrollmentId: r.enrollment_id,
          classDate: date,
          status: r.status || 'present',
        }))
      );
      alert('Asistencia guardada correctamente');
    } catch {
      alert('Error al guardar asistencia');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Control de asistencia</h1>

      <div className="card p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Clase</label>
            <select className="input-field" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="">Seleccionar clase</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} - {c.day_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Fecha</label>
            <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
      </div>

      {selectedClass && records.length > 0 && (
        <>
          <div className="card overflow-x-auto mb-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2d1f42]">
                  <th className="table-header">Estudiante</th>
                  <th className="table-header">Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.enrollment_id} className="border-b border-[#2d1f42]/50">
                    <td className="table-cell font-medium">{r.student_name}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => toggleStatus(i)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          (r.status || 'present') === 'present'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {(r.status || 'present') === 'present' ? 'Presente' : 'Ausente'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar asistencia'}
          </button>
        </>
      )}

      {selectedClass && records.length === 0 && (
        <p className="text-gray-500 text-center py-8">No hay estudiantes inscritos en esta clase</p>
      )}
    </DashboardLayout>
  );
}
