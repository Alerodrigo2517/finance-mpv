'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';

export default function MonthFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const mes = searchParams.get('mes') || currentMonth.toString();
  const anio = searchParams.get('anio') || currentYear.toString();

  const handleDateChange = (newMes: string, newAnio: string) => {
    startTransition(() => {
      router.push(`/resumenes?mes=${newMes}&anio=${newAnio}`);
    });
  };

  const meses = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  const anios = Array.from({ length: (currentYear + 1) - 2024 + 1 }, (_, i) => 2024 + i);

  return (
    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
      <select 
        value={mes} 
        disabled={isPending}
        onChange={(e) => handleDateChange(e.target.value, anio)} 
        className="bg-transparent border-none py-1.5 pl-3 pr-2 text-sm font-bold text-[#0F3160] focus:ring-0 cursor-pointer outline-none disabled:opacity-50"
      >
        {meses.map(m => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
      
      {isPending ? (
        <div className="mx-1 flex items-center justify-center w-px relative h-5">
          <Loader2 className="w-4 h-4 text-[#0F3160] animate-spin absolute" />
        </div>
      ) : (
        <div className="w-px h-5 bg-slate-200 mx-1"></div>
      )}

      <select 
        value={anio} 
        disabled={isPending}
        onChange={(e) => handleDateChange(mes, e.target.value)} 
        className="bg-transparent border-none py-1.5 pl-2 pr-3 text-sm font-bold text-[#0F3160] focus:ring-0 cursor-pointer outline-none disabled:opacity-50"
      >
        {anios.map(a => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
    </div>
  );
}
