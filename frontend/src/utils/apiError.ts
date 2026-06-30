/** Convierte respuestas de error del API (DRF) en un mensaje legible. */
export function formatApiError(data: unknown, fallback = 'Ocurrió un error'): string {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.map(String).join(' ');

  if (typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (record.detail !== undefined) return formatApiError(record.detail, fallback);

    const messages = Object.values(record).flatMap((value) => {
      if (Array.isArray(value)) return value.map(String);
      if (typeof value === 'string') return [value];
      return [];
    });

    if (messages.length) return messages.join(' ');
  }

  return fallback;
}
