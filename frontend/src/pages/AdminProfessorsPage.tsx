/**
 * Listado de profesores con perfil (expertise, bio) para administración.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { usersApi } from '../services/api';

interface Professor {
  id: number;
  expertise: string;
  bio: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    is_active?: boolean;
  };
}

export default function AdminProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);

  useEffect(() => {
    usersApi.getProfessors().then((r) => setProfessors(r.data)).catch(() => {});
  }, []);

  return (
    <AdminLayout>
      <h1 className="font-display text-4xl tracking-wide mb-8">GESTIÓN DE PROFESORES</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card-light p-6">
          <p className="text-sm text-gray-400 mb-2">Total profesores</p>
          <p className="font-display text-4xl text-[#FF6B1A]">{professors.length}</p>
        </div>
        <div className="card-light p-6">
          <p className="text-sm text-gray-400 mb-2">Activos</p>
          <p className="font-display text-4xl text-[#FF6B1A]">
            {professors.filter((p) => p.user.is_active !== false).length}
          </p>
        </div>
        <div className="card-light p-6">
          <p className="text-sm text-gray-400 mb-2">Especialidades</p>
          <p className="font-display text-4xl text-[#FF6B1A]">
            {new Set(professors.map((p) => p.expertise).filter(Boolean)).size}
          </p>
        </div>
      </div>

      <div className="card-light p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl tracking-wide">LISTA DE PROFESORES</h2>
          <Link to="/professor" className="gradient-btn text-sm py-2 px-5">
            Ver panel instructor
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professors.map((prof) => (
            <div key={prof.id} className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5 hover:border-[#FF6B1A] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B1A] to-[#E91E8C] flex items-center justify-center text-xl font-bold">
                  {prof.user.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{prof.user.full_name}</h3>
                  {prof.expertise && (
                    <span className="text-xs px-2 py-1 rounded-full bg-[#E91E8C]/20 text-[#E91E8C]">
                      {prof.expertise}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-2">{prof.user.email}</p>
              {prof.bio && <p className="text-xs text-gray-500 line-clamp-2">{prof.bio}</p>}
            </div>
          ))}
          {professors.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-8">No hay profesores registrados</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
