/** Tipos TypeScript compartidos y utilidades de formato (precio, etiquetas). */
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'admin' | 'director' | 'professor' | 'client';
  document_type?: string;
  document_number?: string;
  gender?: string;
  birth_date?: string;
  phone?: string;
  billing_address?: string;
  city?: string;
  department?: string;
  country?: string;
  expertise?: string;
  bio?: string;
}

export interface ChoreographyVideo {
  id: number;
  part_number: number;
  title: string;
  video_url: string;
}

export interface Choreography {
  id: number;
  title: string;
  song_name: string;
  genre: string;
  difficulty: string;
  description?: string;
  price: number | string;
  sales_count: number;
  status: string;
  thumbnail_emoji: string;
  rating: number | string;
  professor_name: string;
  guest_professor?: number | null;
  guest_professor_external?: string;
  video_count: number;
  videos?: ChoreographyVideo[];
}

export interface CartItem {
  id: number;
  choreography: Choreography;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  item_count: number;
}

export interface PurchaseAccess {
  id: number;
  choreography: Choreography;
  videos_watched: number;
  progress_percent: number;
  purchased_at: string;
}

export interface ProfessorApplication {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  document_type: string;
  document_number: string;
  expertise: string;
  experience: string;
  bio: string;
  status: 'pending' | 'approved' | 'rejected';
  review_notes: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  created_at: string;
  applicant_name?: string;
}

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  director: 'Director',
  professor: 'Profesor',
  client: 'Cliente',
};

export const GENRE_LABELS: Record<string, string> = {
  salsa: 'Salsa', bachata: 'Bachata', merengue: 'Merengue',
  hip_hop: 'Hip-Hop', pop: 'Pop', reggaeton: 'Reggaeton', contemporaneo: 'Contemporáneo',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado',
};

/** Formatea precios en pesos colombianos (COP). */
export const formatPrice = (price: number | string) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(price));

export interface AdminDashboardTotalizers {
  active_users: number;
  published_choreographies: number;
  total_revenue: number;
  total_sales_count: number;
  average_ticket: number;
}

export interface AdminDashboardStats {
  totalizers: AdminDashboardTotalizers;
  statistics: {
    monthly_sales: { month: string; year: number; amount: number }[];
    monthly_registrations: { month: string; year: number; count: number }[];
    top_choreographies: { title: string; genre: string; sales_count: number; revenue: number }[];
    revenue_by_genre: { genre: string; revenue: number; count: number }[];
    average_ticket: number;
    clients_by_country: { country: string; count: number }[];
  };
}
