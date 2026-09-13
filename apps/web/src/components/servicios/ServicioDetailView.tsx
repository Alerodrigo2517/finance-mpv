import FacturasList from '@/components/FacturasList';
import UploadFacturaForm from './UploadFacturaForm';
import { Servicio, Factura } from '@/types';
import { useState } from 'react';

interface ServicioDetailViewProps {
  selectedServicio: Servicio;
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  gastoAnoServicio: number;
  pendientePagoServicio: number;
  consumosAnuales: number[];
  availableYears: number[];
  sortedFacturas: Factura[];
  handleDeleteFactura: (id: string) => void;
  handlePayFactura: (id: string, metodoPago?: string) => Promise<void>;
  handleEditFacturaClick: (f: Factura) => void;
  fetchData: () => void;
}

export default function ServicioDetailView({
  selectedServicio,
  selectedYear,
  setSelectedYear,
  gastoAnoServicio,
  pendientePagoServicio,
  consumosAnuales,
  availableYears,
  sortedFacturas,
  handleDeleteFactura,
  handlePayFactura,
  handleEditFacturaClick,
  fetchData
}: ServicioDetailViewProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [metodoPagoFilter, setMetodoPagoFilter] = useState('TODOS');

  const filteredFacturas = sortedFacturas.filter(f => {
    if (metodoPagoFilter === 'TODOS') return true;
    const m = f.metodoPago || (f as any).metodo_pago;
    if (metodoPagoFilter === 'SIN REGISTRO') {
       return f.estado === 'PAGADA' && !m;
    }
    return m === metodoPagoFilter;
  });
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-right-8 duration-300">
      {/* Top Summaries Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-panel p-5 md:p-6 flex flex-col gap-1 md:gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
          <span className="text-slate-500 font-medium text-sm">Total Facturado (Año)</span>
          <span className="text-3xl md:text-4xl font-bold text-slate-800">
            ${gastoAnoServicio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="glass-panel p-5 md:p-6 flex flex-col gap-1 md:gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <span className="text-slate-500 font-medium text-sm">Ya pagado (Año)</span>
          <span className="text-3xl md:text-4xl font-bold text-emerald-600">
            ${(gastoAnoServicio - pendientePagoServicio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="glass-panel p-5 md:p-6 flex flex-col gap-1 md:gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-danger/10 rounded-full blur-2xl group-hover:bg-danger/20 transition-all"></div>
          <span className="text-slate-500 font-medium text-sm">Pendiente de pago</span>
          <span className="text-3xl md:text-4xl font-bold text-danger">
            ${pendientePagoServicio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Consumo Anual Bar */}
      {consumosAnuales.length > 0 && (
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex flex-col items-center shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Consumo anual ({consumosAnuales.reduce((a, b) => a + b, 0)} kW)
          </span>
          <div className="w-full flex h-8 gap-1 items-end">
            {consumosAnuales.slice(0, 12).map((val, idx) => {
              const max = Math.max(...consumosAnuales);
              const height = max > 0 ? (val / max) * 100 : 0;
              return (
                <div key={idx} className="flex-1 bg-blue-100 rounded-t-sm relative group" style={{ height: `${height}%` }}>
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    {val}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 px-2 gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span>Todas las facturas de</span>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent font-bold text-[#0F3160] border-b-2 border-slate-200 focus:outline-none focus:border-[#0F3160] cursor-pointer"
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Método:</span>
            <select 
              value={metodoPagoFilter} 
              onChange={(e) => setMetodoPagoFilter(e.target.value)}
              className="bg-transparent font-bold text-[#0F3160] border-b-2 border-slate-200 focus:outline-none focus:border-[#0F3160] cursor-pointer"
            >
              <option value="TODOS">Todos</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Mercado Pago">Mercado Pago</option>
              <option value="Cuenta DNI">Cuenta DNI</option>
              <option value="Banco Nación">Banco Nación</option>
              <option value="Banco (Otro)">Banco (Otro)</option>
              <option value="SIN REGISTRO">Sin registro</option>
            </select>
          </div>
        </div>
        <button 
          onClick={() => setShowUpload(!showUpload)}
          className="text-[10px] font-bold bg-[#0F3160] text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#0a244a] transition-colors whitespace-nowrap"
        >
          {showUpload ? 'Cerrar' : '+ Cargar factura'}
        </button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <UploadFacturaForm 
          servicioId={selectedServicio.id} 
          onSuccess={() => { setShowUpload(false); fetchData(); }} 
        />
      )}

      {/* List of Facturas for Detail */}
      <FacturasList 
        facturas={filteredFacturas} 
        nombreProveedor={selectedServicio.nombreProveedor || (selectedServicio as any).nombre_proveedor || ''} 
        onDeleteFactura={handleDeleteFactura} 
        onPayFactura={handlePayFactura}
        onEditFactura={handleEditFacturaClick}
      />
    </div>
  );
}
