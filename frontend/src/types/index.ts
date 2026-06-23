export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'admin' | 'director' | 'professor' | 'client';
  phone?: string;
  billing_address?: string;
  city?: string;
  document_number?: string;
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

export const GENRE_LABELS: Record<string, string> = {
  salsa: 'Salsa', bachata: 'Bachata', merengue: 'Merengue',
  hip_hop: 'Hip-Hop', pop: 'Pop', reggaeton: 'Reggaeton', contemporaneo: 'Contemporáneo',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado',
};

export const formatPrice = (price: number | string) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(price));
