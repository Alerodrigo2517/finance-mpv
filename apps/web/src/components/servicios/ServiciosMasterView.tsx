import { ChevronLeft, Plus, Receipt, Trash2, ChevronRight } from 'lucide-react';
import BlankState from '@/components/ui/BlankState';
import { Servicio } from '@/types';

interface ServiciosMasterViewProps {
  servicios: Servicio[];
  facturadoMesTotal: number;
  pagadoMesTotal: number;
  pendientePagoTotal: number;
  selectedServicioId: string | null;
  setSelectedServicioId: (id: string | null) => void;
  setShowServicioForm: (show: boolean) => void;
  handleDeleteServicio: (e: React.MouseEvent, id: string) => void;
}

export default function ServiciosMasterView({
  servicios,
  facturadoMesTotal,
  pagadoMesTotal,
  pendientePagoTotal,
  selectedServicioId,
  setSelectedServicioId,
  setShowServicioForm,
  handleDeleteServicio
}: ServiciosMasterViewProps) {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in zoom-in-95 duration-200">
      {/* Top Summaries Left */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-panel p-5 md:p-6 flex flex-col gap-1 md:gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
          <span className="text-slate-500 font-medium text-sm">Facturado este mes</span>
          <span className="text-3xl md:text-4xl font-bold text-slate-800">
            ${facturadoMesTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="glass-panel p-5 md:p-6 flex flex-col gap-1 md:gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <span className="text-slate-500 font-medium text-sm">Ya pagado este mes</span>
          <span className="text-3xl md:text-4xl font-bold text-emerald-600">
            ${pagadoMesTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="glass-panel p-5 md:p-6 flex flex-col gap-1 md:gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-danger/10 rounded-full blur-2xl group-hover:bg-danger/20 transition-all"></div>
          <span className="text-slate-500 font-medium text-sm">Pendiente de pago</span>
          <span className="text-3xl md:text-4xl font-bold text-danger">
            ${pendientePagoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* List of Services */}
      <div className="flex flex-col gap-4 mt-2 max-h-[340px] overflow-y-auto pr-2 pb-2">
        {servicios.length === 0 ? (
          <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-sm">
            <BlankState 
              variant="not-found" 
              Icon={Receipt} 
              title="Sin servicios" 
              description="Comienza agregando los servicios que pagas mensualmente (luz, gas, internet, etc)."
              action={
                <button 
                  onClick={() => setShowServicioForm(true)}
                  className="w-full sm:w-auto bg-[#0F3160] hover:bg-[#0a244a] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 mt-2 shadow-md hover:scale-105"
                >
                  <Plus className="w-5 h-5 stroke-[3]" /> 
                  <span>Agregar Nuevo Servicio</span>
                </button>
              }
            />
          </div>
        ) : (
          <>
            {servicios.map(s => {
              const fs = s.facturas ? [...s.facturas].sort((a,b)=> new Date(b.fechaVencimiento || b.fecha_vencimiento || '').getTime() - new Date(a.fechaVencimiento || a.fecha_vencimiento || '').getTime()) : [];
              const ultimaFactura = fs[0];
              const isSelected = selectedServicioId === s.id;

              return (
                <div 
                  key={s.id} 
                  onClick={() => setSelectedServicioId(s.id)}
                  className={`group bg-white border-2 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-[#0F3160] ring-4 ring-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-[#0F3160] text-white' : 'bg-slate-100 text-[#0F3160] group-hover:bg-blue-50'}`}>
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-lg tracking-wide capitalize">{(s.nombreProveedor || s.nombre_proveedor || '').toLowerCase()}</span>
                      {s.facturas && s.facturas.length > 0 && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${s.facturas.some(f => f.estado === 'PENDIENTE') ? 'text-red-500' : 'text-emerald-500'}`}>
                          {s.facturas.some(f => f.estado === 'PENDIENTE') ? 'Con deuda' : 'Al día'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {ultimaFactura && (
                      <div className="flex flex-col items-end mr-2">
                        <span className="text-[10px] text-slate-400 font-medium leading-none mb-1">Última fra.</span>
                        <span className="font-bold text-slate-700 text-sm whitespace-nowrap leading-none">
                          ${Number(ultimaFactura.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteServicio(e, s.id); }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" 
                      title="Eliminar servicio"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className={`transition-colors ${isSelected ? 'text-[#0F3160]' : 'text-slate-300'}`}>
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
