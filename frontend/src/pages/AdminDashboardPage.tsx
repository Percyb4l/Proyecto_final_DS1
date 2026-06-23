import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AdminLayout from '../components/AdminLayout';
import { dashboardApi } from '../services/api';
import { formatPrice, GENRE_LABELS } from '../types';

const COLORS = ['#FF6B1A', '#E91E8C', '#FF8C42', '#C2185B', '#FFB74D', '#FFF8F0'];

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
      <h1 className="font-display text-4xl tracking-wide mb-8">PANEL DE ADMINISTRACIÓN</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Ventas totales', value: formatPrice(data.metrics.total_sales) },
          { label: 'Coreografías vendidas', value: data.metrics.choreos_sold },
          { label: 'Clientes activos', value: data.metrics.active_clients },
          { label: 'Profesores', value: data.metrics.professors },
        ].map((m) => (
          <div key={m.label} className="card-light p-6">
            <p className="text-sm text-gray-400 mb-2">{m.label}</p>
            <p className="font-display text-4xl text-[#FF6B1A]">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card-light p-6">
          <h2 className="font-display text-xl tracking-wide mb-4">VENTAS MENSUALES</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.monthly_sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip contentStyle={{ background: '#242424', border: '1px solid #333', borderRadius: 8 }} />
              <Bar dataKey="amount" fill="#FF6B1A" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-light p-6">
          <h2 className="font-display text-xl tracking-wide mb-4">VENTAS POR GÉNERO</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData.length ? pieData : [{ name: 'Sin datos', value: 1 }]}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {(pieData.length ? pieData : [{ name: 'Sin datos', value: 1 }]).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#242424', border: '1px solid #333', borderRadius: 8 }} />
              <Legend wrapperStyle={{ color: '#FFF8F0' }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-light p-6">
        <h2 className="font-display text-xl tracking-wide mb-4">TOP COREOGRAFÍAS MÁS VENDIDAS</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#333] text-left text-sm text-gray-400">
              <th className="pb-3 font-normal">Nombre</th>
              <th className="pb-3 font-normal">Ventas</th>
              <th className="pb-3 font-normal">Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {data.top_choreographies.map((c) => (
              <tr key={c.title} className="border-b border-[#333]/50">
                <td className="py-4">{c.title}</td>
                <td className="py-4 font-display text-[#FF6B1A]">{c.sales_count}</td>
                <td className="py-4 text-green-500 font-display">{formatPrice(c.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
