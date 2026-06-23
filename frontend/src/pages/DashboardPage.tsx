import { useEffect, useState } from 'react';
import { Users, GraduationCap, Calendar, ClipboardList, DollarSign, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { catalogApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface DashboardData {
  stats: {
    students: number;
    instructors: number;
    classes: number;
    activeEnrollments: number;
    totalRevenue: number;
    pendingPayments: number;
  };
  recentEnrollments: { enrollment_date: string; student_name: string; class_name: string }[];
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (isAdmin) {
      catalogApi.getDashboard().then((r) => setData(r.data)).catch(() => {});
    }
  }, [isAdmin]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  const profileName = user?.profile
    ? `${(user.profile as { first_name: string }).first_name} ${(user.profile as { last_name: string }).last_name}`
    : user?.email;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">
          Hola, <span className="gradient-text">{profileName}</span>
        </h1>
        <p className="text-gray-400">
          {isAdmin ? 'Panel de administración de la academia' : 'Bienvenido a tu panel de Dance Academy'}
        </p>
      </div>

      {isAdmin && data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {[
              { icon: Users, label: 'Estudiantes', value: data.stats.students, color: 'text-violet-400' },
              { icon: GraduationCap, label: 'Instructores', value: data.stats.instructors, color: 'text-blue-400' },
              { icon: Calendar, label: 'Clases', value: data.stats.classes, color: 'text-green-400' },
              { icon: ClipboardList, label: 'Inscripciones', value: data.stats.activeEnrollments, color: 'text-amber-400' },
              { icon: DollarSign, label: 'Ingresos', value: formatCurrency(data.stats.totalRevenue), color: 'text-emerald-400' },
              { icon: AlertCircle, label: 'Pagos pendientes', value: data.stats.pendingPayments, color: 'text-red-400' },
            ].map((stat) => (
              <div key={stat.label} className="card p-4">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Inscripciones recientes</h2>
            {data.recentEnrollments.length === 0 ? (
              <p className="text-gray-500">No hay inscripciones recientes</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2d1f42]">
                      <th className="table-header">Estudiante</th>
                      <th className="table-header">Clase</th>
                      <th className="table-header">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentEnrollments.map((e, i) => (
                      <tr key={i} className="border-b border-[#2d1f42]/50">
                        <td className="table-cell">{e.student_name}</td>
                        <td className="table-cell">{e.class_name}</td>
                        <td className="table-cell">{new Date(e.enrollment_date).toLocaleDateString('es-CO')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!isAdmin && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-2">Accesos rápidos</h2>
            <p className="text-gray-400 text-sm mb-4">Gestiona tus clases, inscripciones y pagos desde el menú lateral.</p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>📅 Consulta las clases disponibles</li>
              <li>📋 Revisa tus inscripciones activas</li>
              <li>💳 Verifica el estado de tus pagos</li>
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-2">Tu perfil</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Email:</span> {user?.email}</p>
              <p><span className="text-gray-500">Rol:</span> <span className="capitalize text-violet-400">{user?.role}</span></p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
