/**
 * Utilidades para mapear campos snake_case de la base de datos a camelCase del frontend.
 */

// Función genérica para convertir un string de snake_case a camelCase
export function snakeToCamel(str: string): string {
  return str.replace(/([-_][a-z])/g, group =>
    group
      .toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );
}

// Función genérica para mapear las keys de un objeto de snake_case a camelCase
export function mapSnakeToCamel<T = any>(obj: any): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(mapSnakeToCamel) as unknown as T;
  }

  const mapped = {} as any;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = snakeToCamel(key);
      mapped[camelKey] = obj[key];
    }
  }

  return mapped as T;
}
