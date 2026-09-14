import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center flex flex-col items-center animate-in zoom-in-95 duration-500 fade-in">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-extrabold text-[#0F3160] mb-2 tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Página no encontrada</h2>
        <p className="text-slate-500 mb-8 leading-relaxed text-sm">
          Parece que la ruta que estás buscando no existe o ha sido movida. Revisa la URL o vuelve al inicio.
        </p>
        <Link 
          href="/" 
          className="w-full flex items-center justify-center gap-2 bg-[#0F3160] hover:bg-[#0a244a] text-white py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
