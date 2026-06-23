import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, TrendingUp, Clock, Flame, Award } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import Navbar from '../components/Navbar';
import { dashboardApi } from '../services/api';
import type { PurchaseAccess, Choreography } from '../types';
import { GENRE_LABELS, DIFFICULTY_LABELS, formatPrice } from '../types';

const THUMB_COLORS = ['#FF6B1A', '#E91E8C'];

interface ChartData {
  activity_weekly: { dia: string; minutos: number }[];
  learning_history: { mes: string; videos: number }[];
  genre_distribution: { name: string; value: number; color: string }[];
  course_progress: { name: string; progress: number; fill: string }[];
}

interface DashboardMetrics {
  purchases_count: number;
  total_spent: number;
  overall_progress: number;
  week_minutes: number;
  streak_days: number;
}

function ActivityTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#242424] border border-[#333] rounded-xl px-4 py-2 text-sm">
      <p className="text-gray-400">{label}</p>
      <p className="text-[#FF6B1A] font-bold">{payload[0].value} min</p>
    </div>
  );
}

function HistoryTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#242424] border border-[#333] rounded-xl px-4 py-2 text-sm">
      <p className="text-gray-400">{label}</p>
      <p className="text-[#E91E8C] font-bold">{payload[0].value} videos</p>
    </div>
  );
}

export default function ClientDashboardPage() {
  const [greeting, setGreeting] = useState('');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    purchases_count: 0, total_spent: 0, overall_progress: 0, week_minutes: 0, streak_days: 0,
  });
  const [charts, setCharts] = useState<ChartData>({
    activity_weekly: [], learning_history: [], genre_distribution: [], course_progress: [],
  });
  const [purchases, setPurchases] = useState<PurchaseAccess[]>([]);
  const [recommended, setRecommended] = useState<Choreography[]>([]);

  useEffect(() => {
    dashboardApi.client().then((r) => {
      setGreeting(r.data.greeting);
      setMetrics(r.data.metrics);
      setCharts(r.data.charts);
      setPurchases(r.data.purchases);
      setRecommended(r.data.recommended);
    }).catch(() => {});
  }, []);

  const maxActivityIndex = charts.activity_weekly.reduce(
    (max, d, i, arr) => (d.minutos > arr[max].minutos ? i : max), 0,
  );

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Navbar />
      <div className="pt-24 px-6 pb-20 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-5xl md:text-6xl tracking-wide mb-2">
            ¡HOLA, <span className="text-[#E91E8C]">{greeting?.toUpperCase()}!</span>
          </h1>
          <p className="text-xl text-gray-400">Bienvenido de nuevo a tu espacio de baile</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Video, label: 'Coreografías', value: String(metrics.purchases_count), color: '#FF6B1A' },
            { icon: TrendingUp, label: 'Progreso global', value: `${metrics.overall_progress}%`, color: '#E91E8C' },
            { icon: Clock, label: 'Minutos esta semana', value: String(metrics.week_minutes), color: '#FF6B1A' },
            { icon: Flame, label: 'Racha actual', value: `${metrics.streak_days} días`, color: '#E91E8C' },
          ].map((kpi) => (
            <div key={kpi.label} className="card-light p-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                <kpi.icon size={18} style={{ color: kpi.color }} />
                {kpi.label}
              </div>
              <p className="font-display text-4xl" style={{ color: kpi.color }}>{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="card-light p-6">
            <h3 className="font-display text-xl tracking-wide mb-1">ACTIVIDAD SEMANAL</h3>
            <p className="text-gray-400 text-xs mb-5">Minutos de práctica por día</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={charts.activity_weekly} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis dataKey="dia" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ActivityTooltip />} cursor={{ fill: 'rgba(255,107,26,0.06)' }} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B1A" />
                    <stop offset="100%" stopColor="#E91E8C" />
                  </linearGradient>
                </defs>
                <Bar dataKey="minutos" radius={[6, 6, 0, 0]}>
                  {charts.activity_weekly.map((_, index) => (
                    <Cell key={index} fill={index === maxActivityIndex ? 'url(#barGradient)' : '#333'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-light p-6">
            <h3 className="font-display text-xl tracking-wide mb-1">HISTORIAL DE APRENDIZAJE</h3>
            <p className="text-gray-400 text-xs mb-5">Videos completados por mes</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={charts.learning_history}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E91E8C" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#E91E8C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<HistoryTooltip />} />
                <Area
                  type="monotone"
                  dataKey="videos"
                  stroke="#E91E8C"
                  strokeWidth={2.5}
                  fill="url(#areaGradient)"
                  dot={{ fill: '#E91E8C', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#FF6B1A' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card-light p-6 flex flex-col">
            <h3 className="font-display text-xl tracking-wide mb-1">GÉNEROS FAVORITOS</h3>
            <p className="text-gray-400 text-xs mb-4">Distribución de tu contenido</p>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={charts.genre_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.genre_distribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`${v}%`, '']}
                    contentStyle={{ background: '#242424', border: '1px solid #333', borderRadius: 12, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {charts.genre_distribution.map((g) => (
                <div key={g.name} className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />
                  {g.name} <span className="font-bold" style={{ color: g.color }}>{g.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-light p-6 md:col-span-2">
            <h3 className="font-display text-xl tracking-wide mb-1">PROGRESO POR CURSO</h3>
            <p className="text-gray-400 text-xs mb-5">Avance en cada coreografía comprada</p>
            {charts.course_progress.length === 0 ? (
              <p className="text-gray-500 text-sm">Compra coreografías para ver tu progreso</p>
            ) : (
              <div className="space-y-5">
                {charts.course_progress.map((course) => (
                  <div key={course.name}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">{course.name}</span>
                      <span className="font-display text-lg" style={{ color: course.fill }}>{course.progress}%</span>
                    </div>
                    <div className="h-3 bg-[#111] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${course.progress}%`,
                          background: course.progress === 100
                            ? `linear-gradient(90deg, ${course.fill} 0%, #FF6B1A 100%)`
                            : `linear-gradient(90deg, #FF6B1A 0%, ${course.fill} 100%)`,
                        }}
                      />
                    </div>
                    {course.progress === 100 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Award size={12} className="text-[#E91E8C]" />
                        <span className="text-[10px] text-[#E91E8C]">¡Completado!</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-[#333]">
              <p className="text-xs text-gray-400 mb-3">Racha de esta semana</p>
              <div className="flex gap-2">
                {charts.activity_weekly.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-lg"
                      style={{
                        height: 28,
                        background: d.minutos > 0 ? 'linear-gradient(135deg,#FF6B1A,#E91E8C)' : '#2a2a2a',
                      }}
                    />
                    <span className="text-[10px] text-gray-500">{d.dia}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <h2 className="font-display text-3xl tracking-wide mb-6">MIS COREOGRAFÍAS</h2>
        {purchases.length === 0 ? (
          <p className="text-gray-500 mb-12">
            Aún no has comprado coreografías. <Link to="/catalog" className="text-[#E91E8C] hover:underline">Explorar catálogo</Link>
          </p>
        ) : (
          <div className="space-y-4 mb-12">
            {purchases.map((p) => (
              <div key={p.id} className="card-light p-6 hover:border-[#FF6B1A]/50 transition-colors">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-[#FF6B1A]/30 to-[#E91E8C]/30 flex items-center justify-center text-4xl flex-shrink-0">
                    {p.choreography.thumbnail_emoji}
                  </div>
                  <div className="flex-1 w-full">
                    <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#E91E8C] text-white mb-2">
                      {GENRE_LABELS[p.choreography.genre]}
                    </span>
                    <h3 className="text-2xl font-semibold mb-1">{p.choreography.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">Prof. {p.choreography.professor_name}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {p.videos_watched} de {p.choreography.video_count} videos vistos
                        </span>
                        <span className="text-[#FF6B1A]">{p.progress_percent}%</span>
                      </div>
                      <div className="h-2 bg-[#111] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FF6B1A] to-[#E91E8C] transition-all"
                          style={{ width: `${p.progress_percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <button className="gradient-btn text-sm py-3 px-8 whitespace-nowrap">
                    {p.progress_percent === 100 ? 'Repetir' : 'Continuar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {recommended.length > 0 && (
          <>
            <h2 className="font-display text-3xl tracking-wide mb-6">RECOMENDADAS PARA TI</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {recommended.map((c, i) => (
                <div key={c.id} className="card-light overflow-hidden hover:border-[#FF6B1A]/50 transition-colors">
                  <div className="h-32 flex items-center justify-center text-5xl" style={{ backgroundColor: THUMB_COLORS[i % 2] }}>
                    {c.thumbnail_emoji}
                  </div>
                  <div className="p-5">
                    <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#E91E8C] text-white mb-3">
                      {GENRE_LABELS[c.genre]} · {DIFFICULTY_LABELS[c.difficulty]}
                    </span>
                    <h3 className="text-xl mb-4">{c.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="font-display text-3xl text-[#FF6B1A]">{formatPrice(c.price)}</span>
                      <Link to="/catalog" className="bg-[#E91E8C] text-white text-sm px-6 py-2 rounded-full hover:opacity-90 transition-opacity">
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
