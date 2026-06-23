import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Award, Clock, Star } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import { classesApi, catalogApi } from '../services/api';
import type { DanceClass, DanceStyle } from '../types';

export default function LandingPage() {
  const [classes, setClasses] = useState<DanceClass[]>([]);
  const [styles, setStyles] = useState<DanceStyle[]>([]);

  useEffect(() => {
    classesApi.getPublic().then((r) => setClasses(r.data)).catch(() => {});
    catalogApi.getDanceStylesPublic().then((r) => setStyles(r.data)).catch(() => {});
  }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  return (
    <PublicLayout>
      <section id="inicio" className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-[#0f0a1a] to-amber-900/20" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #7c3aed 0%, transparent 50%), radial-gradient(circle at 75% 75%, #f59e0b 0%, transparent 50%)'
        }} />
        <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-violet-400 font-medium mb-4 tracking-wider uppercase text-sm">Academia de Baile</p>
            <h1 className="font-display text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Expresa tu <span className="gradient-text">pasión</span> por el baile
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-lg">
              Descubre el mundo del baile con instructores profesionales. Salsa, bachata, hip hop y más en un ambiente único.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary flex items-center gap-2 px-6 py-3">
                Inscríbete ahora <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#clases" className="btn-secondary px-6 py-3">Ver clases</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, label: 'Estudiantes activos', value: '200+' },
              { icon: Award, label: 'Instructores', value: '15+' },
              { icon: Clock, label: 'Clases semanales', value: '50+' },
              { icon: Star, label: 'Estilos de baile', value: '6+' },
            ].map((stat) => (
              <div key={stat.label} className="card p-6 text-center">
                <stat.icon className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="estilos" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-center mb-4">Estilos de baile</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Explora nuestra variedad de disciplinas para todos los niveles
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {styles.map((style) => (
              <div key={style.id} className="card p-6 hover:border-violet-500/50 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-violet-600/20 flex items-center justify-center mb-4 group-hover:bg-violet-600/30 transition-colors">
                  <span className="text-violet-400 font-bold text-lg">{style.name[0]}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{style.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{style.description}</p>
                <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 capitalize">
                  {style.difficulty_level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="clases" className="py-20 px-6 bg-[#1a1225]/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-center mb-4">Clases disponibles</h2>
          <p className="text-gray-400 text-center mb-12">Horarios y tarifas de nuestras clases activas</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div key={cls.id} className="card p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs px-3 py-1 rounded-full bg-violet-600/20 text-violet-300">{cls.dance_style}</span>
                  <span className="text-amber-400 font-semibold">{formatCurrency(cls.monthly_fee)}/mes</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{cls.name}</h3>
                <p className="text-gray-400 text-sm mb-4 flex-1">{cls.description}</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>👤 {cls.instructor_name}</p>
                  <p>📅 {cls.day_name} · {cls.start_time?.slice(0, 5)} - {cls.end_time?.slice(0, 5)}</p>
                  <p>👥 {cls.enrolled_count || 0}/{cls.max_students} cupos</p>
                </div>
                <Link to="/register" className="btn-primary text-center mt-4 text-sm">
                  Inscribirme
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold mb-4">¿Listo para bailar?</h2>
          <p className="text-gray-400 mb-8">
            Únete a nuestra comunidad de bailarines. Cali, Colombia · info@danceacademy.com · +57 300 123 4567
          </p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
            Comenzar ahora <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#2d1f42] py-8 px-6 text-center text-gray-500 text-sm">
        <p>© 2026 Dance Academy · Proyecto Final DS1 · Universidad del Valle</p>
      </footer>
    </PublicLayout>
  );
}
