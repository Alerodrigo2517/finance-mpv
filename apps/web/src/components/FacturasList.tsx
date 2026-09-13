'use client';
import { useState } from 'react';
import { ExternalLink, Download, Check, Edit2, Trash2, Loader2 } from 'lucide-react';

import { Factura } from '@/types';

interface FacturasListProps {
  facturas: Factura[];
  nombreProveedor: string;
  onDeleteFactura: (id: string) => void;
  onPayFactura?: (id: string) => Promise<void>;
  onEditFactura?: (factura: Factura) => void;
}

export default function FacturasList({ facturas, nombreProveedor, onDeleteFactura, onPayFactura, onEditFactura }: FacturasListProps) {
  const [payingId, setPayingId] = useState<string | null>(null);

  const handlePay = async (id: string) => {
    if (!onPayFactura) return;
    setPayingId(id);
    try {
      await onPayFactura(id);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-2 pb-2">
      {facturas.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">No hay facturas cargadas.</div>
      ) : (
        facturas.map((f) => {
          const pDesde = f.periodoDesde || f.periodo_desde;
          const fVenc = f.fechaVencimiento || f.fecha_vencimiento;
          const fechaBase = pDesde ? new Date(pDesde) : new Date(fVenc || f.created_at || new Date().toISOString());
          let mesCapitalizado = '';
          if (!isNaN(fechaBase.getTime())) {
            const mesNombre = fechaBase.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
            mesCapitalizado = mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1);
          }
          const esPendiente = f.estado === 'PENDIENTE';

          return (
            <div key={f.id} className="bg-white border-2 border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors shadow-sm relative group flex flex-col gap-3">
              
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  {mesCapitalizado && <span className="font-black text-[#0F3160] text-xl capitalize tracking-tight">{mesCapitalizado}</span>}
                  <span className="font-medium text-slate-400 text-sm tracking-wide">{nombreProveedor}</span>
                </div>
                
                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-black text-slate-800 text-xl">
                    ${Number(f.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex gap-2 items-center">
                    {esPendiente ? (
                      <div className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold uppercase">Pendiente</div>
                    ) : (
                      <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1"><Check className="w-3 h-3"/> Pagado</div>
                    )}
                    
                    {esPendiente && onPayFactura && (
                      <button 
                        onClick={() => handlePay(f.id)} 
                        disabled={payingId === f.id}
                        className="px-2.5 py-1 bg-[#0F3160] text-white border border-[#0F3160] rounded-lg text-[10px] font-bold uppercase hover:bg-[#0a244a] transition-colors flex items-center gap-1 disabled:opacity-70"
                      >
                        {payingId === f.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3"/>}
                        {payingId === f.id ? 'Cargando...' : 'Pagar'}
                      </button>
                    )}
                    
                    {onEditFactura && (
                      <button onClick={() => onEditFactura(f)} className="p-1 bg-white text-slate-400 hover:text-blue-500 rounded-lg transition-colors" title="Editar Factura">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    <button onClick={() => onDeleteFactura(f.id)} className="p-1 bg-white text-slate-400 hover:text-red-500 rounded-lg transition-colors" title="Eliminar Factura">
                       <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions overlay when hover */}
              {(f.archivoUrl || (f as any).archivo_url) && (() => {
                const url = f.archivoUrl || (f as any).archivo_url;
                return (
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4 justify-start">
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-[#0F3160] hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg"
                  >
                    <ExternalLink className="w-4 h-4" /> Ver factura
                  </a>
                  <a 
                    href={url} 
                    download 
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors bg-slate-100 px-3 py-1.5 rounded-lg"
                  >
                    <Download className="w-4 h-4" /> Descargar
                  </a>
                </div>
              )})()}
            </div>
          );
        })
      )}
    </div>
  );
}
