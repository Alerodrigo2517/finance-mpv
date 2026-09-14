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
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center flex flex-col items-center animate-in zoom-in-95 duration-500 fade-in border border-slate-100">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0F3160] mb-3 tracking-tight">
          ¡Ups! Algo salió mal
        </h2>
        <p className="text-slate-500 mb-8 leading-relaxed text-sm">
          Ocurrió un error inesperado (Error 500) al procesar tu solicitud. Puedes intentar de nuevo o volver más tarde.
        </p>
        <button
          onClick={() => reset()}
          className="w-full bg-[#0F3160] hover:bg-[#0a244a] text-white py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
        >
          Intentar nuevamente
        </button>
      </div>
    </div>
  );
}
