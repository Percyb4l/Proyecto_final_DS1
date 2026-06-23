import type { User } from '../types';

export function getAccountPath(role?: User['role'] | string): string {
  if (role === 'admin' || role === 'director') return '/admin';
  if (role === 'professor') return '/professor';
  return '/dashboard';
}
