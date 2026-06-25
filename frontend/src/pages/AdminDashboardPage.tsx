import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import AdminLayout from '../components/AdminLayout';
import { dashboardApi } from '../services/api';
import { formatPrice, type AdminDashboardStats } from '../types';

const COLORS = ['#FF6B1A', '#E91E8C', '#FF8C42', '#C2185B', '#FFB74D', '#9B59B6', '#FFF8F0'];

const tooltipStyle = { background: '#242424', border: '1px solid #333', borderRadius: 8 };

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardStats | null>(null);

  useEffect(() => {
    dashboardApi.admin().then((r) => setData(r.data)).catch(() => {});
  }, []);

  if (!data) {
    return (
      <AdminLayout>
        <p className="text-gray-500">Cargando...</p>
      </AdminLayout>
    );
  }

  const { totalizers, statistics } = data;
  const genrePieData = statistics.revenue_by_genre.map((g) => ({
    name: g.genre,
    value: g.revenue,
  }));
  const countryPieData = statistics.clients_by_country.map((c) => ({
    name: c.country,
    value: c.count,
  }));

  return (
    <AdminLayout>
      <h1 className="font-display text-4xl tracking-wide mb-8">PANEL DE ADMINISTRACIÓN</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Usuarios activos', value: totalizers.active_users },
          { label: 'Coreografías publicadas', value: totalizers.published_choreographies },
          { label: 'Ingresos totales', value: formatPrice(totalizers.total_revenue) },
          { label: 'Ventas realizadas', value: totalizers.total_sales_count },
        ].map((m) => (
          <div key={m.label} className="card-light p-6">
            <p className="text-sm text-gray-400 mb-2">{m.label}</p>
            <p className="font-display text-3xl lg:text-4xl text-[#FF6B1A]">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="card-light p-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">Ticket promedio de compra</p>
          <p className="font-display text-4xl text-[#E91E8C]">{formatPrice(statistics.average_ticket)}</p>
        </div>
        <p className="text-sm text-gray-500 max-w-md">
          Promedio calculado sobre {totalizers.total_sales_count} ventas completadas en la plataforma.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card-light p-6">
          <h2 className="font-display text-xl tracking-wide mb-4">VENTAS POR MES</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statistics.monthly_sales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [formatPrice(value), 'Ingresos']}
              />
              <Bar dataKey="amount" fill="#FF6B1A" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-light p-6">
          <h2 className="font-display text-xl tracking-wide mb-4">USUARIOS REGISTRADOS POR MES</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={statistics.monthly_registrations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value, 'Clientes']} />
              <Line type="monotone" dataKey="count" stroke="#E91E8C" strokeWidth={3} dot={{ fill: '#E91E8C', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card-light p-6">
          <h2 className="font-display text-xl tracking-wide mb-4">INGRESOS POR GÉNERO</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={genrePieData.length ? genrePieData : [{ name: 'Sin datos', value: 1 }]}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {(genrePieData.length ? genrePieData : [{ name: 'Sin datos', value: 1 }]).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [formatPrice(value), 'Ingresos']}
              />
              <Legend wrapperStyle={{ color: '#FFF8F0' }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card-light p-6">
          <h2 className="font-display text-xl tracking-wide mb-4">CLIENTES POR PAÍS</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={countryPieData.length ? countryPieData : [{ name: 'Sin datos', value: 1 }]}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {(countryPieData.length ? countryPieData : [{ name: 'Sin datos', value: 1 }]).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value, 'Clientes']} />
              <Legend wrapperStyle={{ color: '#FFF8F0' }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-light p-6">
        <h2 className="font-display text-xl tracking-wide mb-4">TOP 5 COREOGRAFÍAS MÁS VENDIDAS</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-[#333] text-left text-sm text-gray-400">
                <th className="pb-3 font-normal">Nombre</th>
                <th className="pb-3 font-normal">Género</th>
                <th className="pb-3 font-normal">Ventas</th>
                <th className="pb-3 font-normal">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {statistics.top_choreographies.map((c) => (
                <tr key={c.title} className="border-b border-[#333]/50">
                  <td className="py-4">{c.title}</td>
                  <td className="py-4 text-gray-400">{c.genre}</td>
                  <td className="py-4 font-display text-[#FF6B1A]">{c.sales_count}</td>
                  <td className="py-4 text-green-500 font-display">{formatPrice(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
