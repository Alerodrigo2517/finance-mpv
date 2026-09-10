'use client';
import { ExternalLink, Download } from 'lucide-react';

type Factura = {
  id: string;
  periodoDesde?: string;
  fechaVencimiento: string;
  monto: number;
  estado: string;
  archivoUrl?: string;
};

interface FacturasListProps {
  facturas: Factura[];
  nombreProveedor: string;
  onDeleteFactura: (id: string) => void;
}

export default function FacturasList({ facturas, nombreProveedor, onDeleteFactura }: FacturasListProps) {
  return (
    <div className="flex flex-col gap-4">
      {facturas.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">No hay facturas cargadas.</div>
      ) : (
        facturas.map((f) => {
          const fechaBase = f.periodoDesde ? new Date(f.periodoDesde) : new Date(f.fechaVencimiento);
          const mesNombre = fechaBase.toLocaleDateString('es-ES', { month: 'long', timeZone: 'UTC' });
          const mesCapitalizado = mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1);
          const esPendiente = f.estado === 'PENDIENTE';

          return (
            <div key={f.id} className="bg-white border-2 border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors shadow-sm relative group">
              <div className="flex justify-end mb-2">
                <span className="font-black text-slate-800 text-lg">
                  {Number(f.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-800 text-lg tracking-wide">{nombreProveedor} <span className="text-sm font-medium text-slate-400 ml-1">({mesCapitalizado})</span></span>
                
                <div className="flex gap-2">
                  {esPendiente ? (
                    <div className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold uppercase">Pendiente</div>
                  ) : (
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-bold uppercase">Pagado</div>
                  )}
                  <button onClick={() => onDeleteFactura(f.id)} className="px-3 py-1 bg-white text-red-500 border border-red-500 rounded-lg text-xs font-bold uppercase hover:bg-red-50 transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Quick Actions overlay when hover */}
              {f.archivoUrl && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4 justify-start">
                  <a 
                    href={f.archivoUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-[#0F3160] hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg"
                  >
                    <ExternalLink className="w-4 h-4" /> Ver factura
                  </a>
                  <a 
                    href={f.archivoUrl} 
                    download 
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors bg-slate-100 px-3 py-1.5 rounded-lg"
                  >
                    <Download className="w-4 h-4" /> Descargar
                  </a>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
