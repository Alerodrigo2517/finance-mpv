'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, CalendarDays, Search, Loader2 } from 'lucide-react';

export default function HistoryModal({ historiales }: { historiales: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isNavigating && !isPending) {
      setIsOpen(false);
      setIsNavigating(false);
    }
  }, [searchParams, isPending]);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [mesFiltro, setMesFiltro] = useState(currentMonth.toString());
  const [anioFiltro, setAnioFiltro] = useState(currentYear.toString());

  const handleFiltroManual = () => {
    setIsNavigating(true);
    startTransition(() => {
      router.push(`/resumenes?mes=${mesFiltro}&anio=${anioFiltro}`);
    });
  };

  const mesesOptions = [
    { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' }, { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' }, { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
  ];
  const aniosOptions = Array.from({ length: (currentYear + 1) - 2024 + 1 }, (_, i) => 2024 + i);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-sm text-[#0F3160] bg-blue-50 hover:bg-[#0F3160] hover:text-white px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 font-bold shadow-sm hover:shadow-md border border-[#0F3160]/10"
      >
        <CalendarDays className="w-5 h-5" /> Elegir otro mes del historial
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden transform animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-[#0F3160]">Historial Completo</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6">
              {isNavigating ? (
                <div className="flex flex-col items-center justify-center py-8 animate-in fade-in zoom-in duration-300">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#0F3160]/20 rounded-full blur-xl animate-pulse"></div>
                    <Loader2 className="w-16 h-16 text-[#0F3160] animate-spin relative z-10" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-800">Cargando datos...</h3>
                  <p className="text-sm text-slate-500 mt-2 text-center max-w-xs">Preparando tu resumen financiero para la fecha seleccionada</p>
                </div>
              ) : (
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] font-bold text-[#0F3160] uppercase tracking-wider">Mes</label>
                    <select value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#0F3160] text-slate-900 w-full cursor-pointer">
                      {mesesOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] font-bold text-[#0F3160] uppercase tracking-wider">Año</label>
                    <select value={anioFiltro} onChange={(e) => setAnioFiltro(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#0F3160] text-slate-900 w-full cursor-pointer">
                      {aniosOptions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <button 
                    onClick={handleFiltroManual}
                    className="bg-[#0F3160] hover:bg-[#0a244a] text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors sm:w-auto w-full flex justify-center items-center gap-2 whitespace-nowrap shadow-sm"
                  >
                    <Search className="w-4 h-4" /> Buscar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
