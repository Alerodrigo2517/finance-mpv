'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, ArrowLeft } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured by Global Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center flex flex-col items-center animate-in zoom-in-95 duration-500 fade-in border border-slate-100">
        <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
          <AlertOctagon className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0F3160] mb-3 tracking-tight">
          Error Interno (500)
        </h2>
        <p className="text-slate-500 mb-8 leading-relaxed text-sm">
          Se ha producido un error grave en la aplicación que impidió cargar esta página. Nuestro equipo técnico ha sido alertado.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => reset()}
            className="w-full bg-[#0F3160] hover:bg-[#0a244a] text-white py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
          >
            Intentar cargar de nuevo
          </button>
          <Link 
            href="/" 
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl font-bold transition-all flex justify-center items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
