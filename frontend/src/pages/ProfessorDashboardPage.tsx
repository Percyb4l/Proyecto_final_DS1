/**
 * Dashboard del profesor: métricas reales del API y acceso al CRUD.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Video, DollarSign, Star, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Navbar from '../components/Navbar';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Choreography } from '../types';
import { GENRE_LABELS, formatPrice } from '../types';

const THUMB_COLORS = ['#FF6B1A', '#E91E8C'];
const PIE_COLORS = ['#FF6B1A', '#E91E8C', '#FFF8F0', '#666', '#444'];

interface ProfessorDashboard {
  greeting: string;
  metrics: {
    choreographies_count: number;
    total_students: number;
    total_revenue: number;
    average_rating: number;
  };
  charts: {
    monthly_sales: { month: string; ventas: number }[];
    sales_by_genre: { genre: string; ventas: number }[];
    choreography_sales: { title: string; ventas: number }[];
  };
  choreographies: Choreography[];
}

export default function ProfessorDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ProfessorDashboard | null>(null);

  useEffect(() => {
    dashboardApi.professor().then((r) => setData(r.data)).catch(() => {});
  }, []);

  const choreos = data?.choreographies ?? [];
  const metrics = data?.metrics;

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Navbar />
      <div className="pt-24 px-6 pb-20 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="font-display text-5xl md:text-6xl tracking-wide mb-2">
            ¡HOLA, <span className="text-[#FF6B1A]">{(data?.greeting || user?.first_name || '').toUpperCase()}!</span>
          </h1>
          <p className="text-xl text-gray-400">Panel de instructor — {user?.full_name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Users, label: 'Estudiantes totales', value: metrics?.total_students ?? 0 },
            { icon: Video, label: 'Coreografías publicadas', value: metrics?.choreographies_count ?? 0 },
            { icon: DollarSign, label: 'Ingresos generados', value: formatPrice(metrics?.total_revenue ?? 0) },
            { icon: Star, label: 'Calificación promedio', value: (metrics?.average_rating ?? 0).toFixed(1), star: true },
          ].map((m) => (
            <div key={m.label} className="card-light p-8">
              <div className="flex items-center gap-3 mb-3">
                <m.icon className="w-6 h-6 text-[#E91E8C]" />
                <span className="text-sm text-gray-400">{m.label}</span>
              </div>
              <p className="font-display text-5xl text-[#FF6B1A] flex items-center gap-2">
                {m.value}
                {m.star && <Star className="w-8 h-8 fill-[#FF6B1A] text-[#FF6B1A]" />}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          <div className="card-light p-6">
            <h2 className="font-display text-2xl tracking-wide mb-6">VENTAS POR MES</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.charts.monthly_sales ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip contentStyle={{ background: '#242424', border: '1px solid #333', borderRadius: 8 }} />
                <Bar dataKey="ventas" fill="#E91E8C" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card-light p-6">
            <h2 className="font-display text-2xl tracking-wide mb-6">VENTAS POR GÉNERO</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data?.charts.sales_by_genre ?? []}
                  dataKey="ventas"
                  nameKey="genre"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(data?.charts.sales_by_genre ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#242424', border: '1px solid #333', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-3xl tracking-wide">MIS COREOGRAFÍAS</h2>
          <Link to="/admin/choreographies/new" className="gradient-btn text-sm">+ Agregar nueva</Link>
        </div>

        <div className="space-y-4">
          {choreos.map((c, i) => (
            <div key={c.id} className="card-light p-6 hover:border-[#FF6B1A]/50 transition-colors">
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div
                  className="w-32 h-32 rounded-xl flex items-center justify-center text-5xl flex-shrink-0"
                  style={{ backgroundColor: THUMB_COLORS[i % 2] }}
                >
                  {c.thumbnail_emoji}
                </div>
                <div className="flex-1 w-full">
                  <span className="tag-fuchsia mb-2 inline-block">{GENRE_LABELS[c.genre]}</span>
                  <h3 className="text-2xl font-semibold mb-4">{c.title}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 flex items-center gap-1"><Users className="w-4 h-4" /> Estudiantes</p>
                      <p className="font-display text-2xl text-[#FF6B1A]">{c.sales_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 flex items-center gap-1"><DollarSign className="w-4 h-4" /> Ingresos</p>
                      <p className="font-display text-2xl text-[#FF6B1A]">
                        {formatPrice(Number(c.price) * c.sales_count)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 flex items-center gap-1"><Star className="w-4 h-4" /> Calificación</p>
                      <p className="font-display text-2xl text-[#FF6B1A] flex items-center gap-1">
                        {c.rating} <Star className="w-5 h-5 fill-[#FF6B1A] text-[#FF6B1A]" />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 flex items-center gap-1"><Eye className="w-4 h-4" /> Videos</p>
                      <p className="font-display text-2xl text-[#FF6B1A]">{c.video_count}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Link to={`/admin/choreographies/${c.id}/edit`} className="border-2 border-[#333] text-gray-300 text-sm py-2 px-6 rounded-full hover:border-[#FF6B1A] hover:text-[#FF6B1A] transition-colors text-center">
                    Editar
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {choreos.length === 0 && (
            <p className="text-gray-500 text-center py-12">Aún no tienes coreografías publicadas</p>
          )}
        </div>
      </div>
    </div>
  );
}
