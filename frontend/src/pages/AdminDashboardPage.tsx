import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AdminLayout from '../components/AdminLayout';
import { dashboardApi } from '../services/api';
import { formatPrice, GENRE_LABELS } from '../types';

const COLORS = ['#FF6B1A', '#E91E8C', '#FFF8F0', '#FF8C42', '#C2185B', '#FFB74D'];

export default function AdminDashboardPage() {
  const [data, setData] = useState<{
    metrics: { total_sales: number; choreos_sold: number; active_clients: number; professors: number };
    sales_by_genre: { choreography__genre: string; count: number; revenue: number }[];
    top_choreographies: { title: string; sales_count: number; revenue: number; genre: string }[];
    monthly_sales: { month: string; amount: number }[];
  } | null>(null);

  useEffect(() => { dashboardApi.admin().then((r) => setData(r.data)).catch(() => {}); }, []);

  if (!data) return <AdminLayout><p className="text-gray-500">Cargando...</p></AdminLayout>;

  const pieData = data.sales_by_genre.map((g) => ({
    name: GENRE_LABELS[g.choreography__genre] || g.choreography__genre,
    value: g.count,
  }));

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl tracking-wide mb-8">DASHBOARD</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Ventas totales', value: formatPrice(data.metrics.total_sales) },
          { label: 'Coreografías vendidas', value: data.metrics.choreos_sold },
          { label: 'Clientes activos', value: data.metrics.active_clients },
          { label: 'Profesores', value: data.metrics.professors },
        ].map((m) => (
          <div key={m.label} className="card p-5">
            <p className="text-sm text-gray-500 mb-1">{m.label}</p>
            <p className="font-display text-3xl text-[#FF6B1A]">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="font-display text-lg tracking-wide mb-4">VENTAS MENSUALES</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.monthly_sales}>
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #333' }} />
              <Bar dataKey="amount" fill="#FF6B1A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg tracking-wide mb-4">VENTAS POR GÉNERO</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData.length ? pieData : [{ name: 'Sin datos', value: 1 }]} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                {(pieData.length ? pieData : [{ name: 'Sin datos', value: 1 }]).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg tracking-wide mb-4">TOP COREOGRAFÍAS MÁS VENDIDAS</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#333] text-left text-xs text-gray-500 uppercase">
              <th className="pb-3">Nombre</th><th className="pb-3">Género</th><th className="pb-3">Ventas</th><th className="pb-3">Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {data.top_choreographies.map((c) => (
              <tr key={c.title} className="border-b border-[#333]/50">
                <td className="py-3">{c.title}</td>
                <td className="py-3 text-[#E91E8C]">{GENRE_LABELS[c.genre]}</td>
                <td className="py-3">{c.sales_count}</td>
                <td className="py-3 text-green-400">{formatPrice(c.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
