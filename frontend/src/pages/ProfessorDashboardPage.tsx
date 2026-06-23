import { useEffect, useState } from 'react';
import { Users, Video, DollarSign, Star, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import { choreoApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Choreography } from '../types';
import { GENRE_LABELS, formatPrice } from '../types';

const THUMB_COLORS = ['#FF6B1A', '#E91E8C'];

const monthlyStudents = [
  { month: 'Ene', estudiantes: 45 },
  { month: 'Feb', estudiantes: 62 },
  { month: 'Mar', estudiantes: 58 },
  { month: 'Abr', estudiantes: 78 },
  { month: 'May', estudiantes: 71 },
  { month: 'Jun', estudiantes: 89 },
];

export default function ProfessorDashboardPage() {
  const { user } = useAuth();
  const [choreos, setChoreos] = useState<Choreography[]>([]);

  useEffect(() => {
    choreoApi.getAll().then((r) => setChoreos(r.data)).catch(() => {});
  }, []);

  const totalStudents = choreos.reduce((s, c) => s + c.sales_count, 0);
  const totalRevenue = choreos.reduce((s, c) => s + Number(c.price) * c.sales_count, 0);
  const avgRating = choreos.length
    ? choreos.reduce((s, c) => s + Number(c.rating), 0) / choreos.length
    : 0;

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Navbar />
      <div className="pt-24 px-6 pb-20 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="font-display text-5xl md:text-6xl tracking-wide mb-2">
            ¡HOLA, <span className="text-[#FF6B1A]">{user?.first_name?.toUpperCase()}!</span>
          </h1>
          <p className="text-xl text-gray-400">Panel de instructor — {user?.full_name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Users, label: 'Estudiantes totales', value: totalStudents },
            { icon: Video, label: 'Coreografías publicadas', value: choreos.length },
            { icon: DollarSign, label: 'Ingresos generados', value: formatPrice(totalRevenue) },
            { icon: Star, label: 'Calificación promedio', value: avgRating.toFixed(1), star: true },
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

        <div className="card-light p-6 mb-12">
          <h2 className="font-display text-3xl tracking-wide mb-6">NUEVOS ESTUDIANTES POR MES</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyStudents}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip contentStyle={{ background: '#242424', border: '1px solid #333', borderRadius: 8 }} />
              <Bar dataKey="estudiantes" fill="#E91E8C" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-3xl tracking-wide">MIS COREOGRAFÍAS</h2>
          <button className="gradient-btn text-sm">+ Agregar nueva</button>
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
                  <button className="gradient-btn text-sm py-2 px-6">Ver detalles</button>
                  <button className="border-2 border-[#333] text-gray-300 text-sm py-2 px-6 rounded-full hover:border-[#FF6B1A] hover:text-[#FF6B1A] transition-colors">
                    Editar
                  </button>
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
