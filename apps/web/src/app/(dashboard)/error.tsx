'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured by Error Boundary:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-red-600" />
      </div>
      <h2 className="text-3xl font-bold text-[#0F3160] mb-3">
        ¡Ups! Algo salió mal
      </h2>
      <p className="text-slate-500 max-w-md mb-8">
        Ocurrió un error inesperado al intentar cargar los datos. Nuestro equipo ya ha sido notificado.
      </p>
      <button
        onClick={() => reset()}
        className="bg-[#0F3160] hover:bg-[#0a244a] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
      >
        Intentar nuevamente
      </button>
    </div>
  );
}
