import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import CatalogPage from './pages/CatalogPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminChoreographiesPage from './pages/AdminChoreographiesPage';
import AdminSalesPage from './pages/AdminSalesPage';
import AdminProfessorsPage from './pages/AdminProfessorsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import ProfessorDashboardPage from './pages/ProfessorDashboardPage';
import { getAccountPath } from './utils/auth';

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A]"><p className="text-[#FF6B1A]">Cargando...</p></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to={getAccountPath(user.role)} />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/cart" element={<PrivateRoute roles={['client']}><CartPage /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute roles={['client']}><ClientDashboardPage /></PrivateRoute>} />
      <Route path="/professor" element={<PrivateRoute roles={['professor']}><ProfessorDashboardPage /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute roles={['admin', 'director']}><AdminDashboardPage /></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute roles={['admin', 'director']}><AdminUsersPage /></PrivateRoute>} />
      <Route path="/admin/choreographies" element={<PrivateRoute roles={['admin', 'director', 'professor']}><AdminChoreographiesPage /></PrivateRoute>} />
      <Route path="/admin/sales" element={<PrivateRoute roles={['admin', 'director']}><AdminSalesPage /></PrivateRoute>} />
      <Route path="/admin/professors" element={<PrivateRoute roles={['admin', 'director']}><AdminProfessorsPage /></PrivateRoute>} />
      <Route path="/admin/settings" element={<PrivateRoute roles={['admin', 'director']}><AdminSettingsPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
