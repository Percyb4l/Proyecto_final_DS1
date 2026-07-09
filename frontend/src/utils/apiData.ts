/** Garantiza que respuestas del API se traten como arreglo (evita crash si llega HTML u objeto). */
export function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}
