import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full p-4">
      <div className="max-w-xs w-full bg-white rounded-3xl shadow-xl p-8 text-center flex flex-col items-center animate-in zoom-in-95 duration-500 fade-in border border-slate-100">
        <div className="w-20 h-20 bg-blue-50 text-[#0F3160] rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
        <h2 className="text-xl font-extrabold text-[#0F3160] mb-2 tracking-tight">
          Cargando
        </h2>
        <p className="text-slate-500 text-sm">
          Por favor, espera un momento...
        </p>
      </div>
    </div>
  );
}
