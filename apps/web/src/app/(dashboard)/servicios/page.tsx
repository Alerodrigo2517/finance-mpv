'use client';
import { useState, useEffect } from 'react';
import { Search, Wifi, Droplet, Zap, Tv, Home, Shield, Receipt } from 'lucide-react';

type Servicio = { id: string; tipo: string; nombreProveedor: string; facturas?: any[] };
type Deuda = { id: string; nombre: string; montoTotal: number; fechaInicio: string; cuotas?: any[] };

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Modals/Forms
  const [showServicioForm, setShowServicioForm] = useState(false);
  const [sNombre, setSNombre] = useState('');

  const [showDeudaForm, setShowDeudaForm] = useState(false);
  const [dEntidad, setDEntidad] = useState('');
  const [dMonto, setDMonto] = useState('');
  const [dFecha, setDFecha] = useState('');

  // Factura state
  const [facturaServicioId, setFacturaServicioId] = useState<string | null>(null);
  const [fMonto, setFMonto] = useState('');
  const [fVencimiento, setFVencimiento] = useState('');

  const fetchData = async () => {
    try {
      const [resS, resD] = await Promise.all([
        fetch('/api/servicios'),
        fetch('/api/deudas')
      ]);
      if (resS.ok) setServicios(await resS.json());
      if (resD.ok) setDeudas(await resD.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleServicioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/servicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: sNombre }),
      });
      if (res.ok) {
        setSNombre('');
        setShowServicioForm(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeudaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/deudas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entidad: dEntidad, montoTotal: dMonto, fechaInicio: dFecha }),
      });
      if (res.ok) {
        setDEntidad(''); setDMonto(''); setDFecha('');
        setShowDeudaForm(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-[#0F3160]">Servicios y Deudas</h1>
      <p className="text-lg text-slate-500 mb-6">Gestión de pagos fijos y préstamos</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

        {/* SERVICIOS CARD */}
        <div className="glass-panel p-8 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold text-[#0F3160]">Servicios Activos</span>
            <button className="btn-secondary text-sm px-3 py-1" onClick={() => setShowServicioForm(!showServicioForm)}>
              {showServicioForm ? 'Cancelar' : '+ Agregar'}
            </button>
          </div>

          {showServicioForm && (
            <form onSubmit={handleServicioSubmit} className="flex flex-col gap-3 mt-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <input type="text" placeholder="Nombre (Ej. Internet)" value={sNombre} onChange={(e) => setSNombre(e.target.value)} required className="input-field" />
              <button type="submit" className="btn-primary">Guardar</button>
            </form>
          )}

          <div className="mt-4 flex flex-col gap-2">
            {loading ? <p className="text-slate-500 text-center py-8">Cargando...</p> :
              servicios.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-xl mt-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-[#0F3160] font-bold mb-1">Sin servicios registrados</h4>
                  <p className="text-slate-500 text-sm max-w-[220px]">Agrega tus servicios fijos para llevar un control mensual.</p>
                  <button onClick={() => setShowServicioForm(true)} className="mt-4 text-primary font-medium text-sm hover:underline">
                    + Agregar servicio
                  </button>
                </div>
              ) :
                servicios.map(s => {
                const pendientes = s.facturas?.filter((f: any) => f.estado === 'PENDIENTE') || [];
                
                const getServiceIcon = (name: string) => {
                  const n = name.toLowerCase();
                  if (n.includes('internet') || n.includes('wifi') || n.includes('fibertel') || n.includes('telecentro') || n.includes('claro')) return <Wifi className="w-5 h-5 text-blue-500" />;
                  if (n.includes('luz') || n.includes('edenor') || n.includes('edesur')) return <Zap className="w-5 h-5 text-amber-500" />;
                  if (n.includes('agua') || n.includes('aysa')) return <Droplet className="w-5 h-5 text-cyan-500" />;
                  if (n.includes('gas') || n.includes('metrogas')) return <Zap className="w-5 h-5 text-orange-500" />;
                  if (n.includes('tv') || n.includes('cable') || n.includes('directv')) return <Tv className="w-5 h-5 text-purple-500" />;
                  if (n.includes('seguro')) return <Shield className="w-5 h-5 text-emerald-500" />;
                  if (n.includes('expensas') || n.includes('alquiler')) return <Home className="w-5 h-5 text-indigo-500" />;
                  return <Receipt className="w-5 h-5 text-slate-400" />;
                };

                return (
                 <div key={s.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 group">
                   <div className="flex justify-between items-start">
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                         {getServiceIcon(s.nombreProveedor)}
                       </div>
                       <div>
                         <span className="font-bold text-[#0F3160] block leading-tight text-[15px]">{s.nombreProveedor}</span>
                         <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">{s.tipo || 'General'}</span>
                       </div>
                     </div>
                     <button 
                       className={`transition-opacity bg-blue-50 text-[#0F3160] hover:bg-blue-100 font-bold text-xs px-3 py-1.5 rounded-lg whitespace-nowrap ${facturaServicioId === s.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                       onClick={() => {
                         if (facturaServicioId === s.id) {
                           setFacturaServicioId(null);
                         } else {
                           setFacturaServicioId(s.id);
                           setFMonto('');
                           setFVencimiento('');
                         }
                       }}
                     >
                       {facturaServicioId === s.id ? 'Cancelar' : '+ Cargar Factura'}
                     </button>
                   </div>

                   {facturaServicioId === s.id && (
                     <form 
                       className="mt-1 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col gap-2"
                       onSubmit={(e) => {
                         e.preventDefault();
                         fetch('/api/facturas', {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({
                             servicioId: s.id,
                             monto: fMonto,
                             fechaVencimiento: fVencimiento,
                             periodoDesde: fVencimiento,
                             periodoHasta: fVencimiento
                           })
                         }).then(() => {
                           setFacturaServicioId(null);
                           setFMonto('');
                           setFVencimiento('');
                           fetchData();
                         });
                       }}
                     >
                       <div className="flex gap-2">
                         <input type="number" step="0.01" required placeholder="Monto ($)" value={fMonto} onChange={e => setFMonto(e.target.value)} className="input-field py-1.5 text-sm flex-1 bg-white" />
                         <input type="date" required value={fVencimiento} onChange={e => setFVencimiento(e.target.value)} className="input-field py-1.5 text-sm flex-1 text-slate-500 bg-white" />
                       </div>
                       <div className="flex justify-end gap-2 mt-1">
                         <button type="button" onClick={() => setFacturaServicioId(null)} className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1">Cancelar</button>
                         <button type="submit" className="bg-[#0F3160] hover:bg-[#0a244a] transition-colors text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm">Guardar Factura</button>
                       </div>
                     </form>
                   )}
                   
                   {pendientes.length > 0 && <div className="h-px w-full bg-slate-100 my-1"></div>}
                   
                   {pendientes.length === 0 ? (
                     <div className="flex items-center gap-2 mt-1 px-1">
                       <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                       <span className="text-xs font-semibold text-slate-500">Al día</span>
                     </div>
                   ) : (
                     <div className="flex flex-col gap-2">
                       {pendientes.map((f: any) => {
                         const mesFactura = new Date(f.periodoDesde || f.fechaVencimiento).toLocaleDateString('es-ES', { month: 'long', timeZone: 'UTC' });
                         return (
                           <div key={f.id} className="flex justify-between items-center p-3 bg-red-50/50 rounded-xl border border-red-100/50 group/factura">
                             <div className="flex flex-col">
                               <span className="text-sm font-bold text-slate-800 capitalize mb-0.5">
                                 Período {mesFactura}
                               </span>
                               <div className="flex items-center gap-2">
                                 <span className="text-sm font-black text-danger">{Number(f.monto).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
                                 <span className="text-[10px] text-red-600 font-medium bg-red-100 px-1.5 py-0.5 rounded">
                                   Vence {new Date(f.fechaVencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })}
                                 </span>
                               </div>
                             </div>
                             <button 
                               className="bg-white hover:bg-danger hover:text-white border border-red-200 text-danger px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors" 
                               onClick={async () => {
                                 await fetch(`/api/facturas/${f.id}`, { method: 'PATCH', body: JSON.stringify({ estado: 'PAGADA' }) });
                                 fetchData();
                               }}
                             >
                               Pagar
                             </button>
                           </div>
                         );
                       })}
                     </div>
                   )}
                 </div>
               );
             })
            }
          </div>
        </div>

        {/* DEUDAS CARD */}
        <div className="glass-panel p-8 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold text-[#0F3160]">Deudas Pendientes</span>
            <button className="btn-secondary text-sm px-3 py-1" onClick={() => setShowDeudaForm(!showDeudaForm)}>
              {showDeudaForm ? 'Cancelar' : '+ Agregar'}
            </button>
          </div>

          {showDeudaForm && (
            <form onSubmit={handleDeudaSubmit} className="flex flex-col gap-3 mt-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <input type="text" placeholder="Entidad/Persona" value={dEntidad} onChange={(e) => setDEntidad(e.target.value)} required className="input-field" />
              <input type="number" placeholder="Monto Total" value={dMonto} onChange={(e) => setDMonto(e.target.value)} required className="input-field" />
              <input type="date" value={dFecha} onChange={(e) => setDFecha(e.target.value)} required className="input-field text-slate-500" />
              <button type="submit" className="btn-primary">Guardar</button>
            </form>
          )}

          <div className="mt-4 flex flex-col gap-2">
            {loading ? <p className="text-slate-500 text-center py-8">Cargando...</p> :
              deudas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-xl mt-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-[#0F3160] font-bold mb-1">Sin deudas pendientes</h4>
                  <p className="text-slate-500 text-sm max-w-[220px]">Registra una deuda o préstamo para seguir tus cuotas.</p>
                  <button onClick={() => setShowDeudaForm(true)} className="mt-4 text-primary font-medium text-sm hover:underline">
                    + Cargar deuda
                  </button>
                </div>
              ) :
                deudas.map(d => {
               const pagadas = d.cuotas?.filter((c: any) => c.estado === 'PAGADA').length || 0;
               const totales = d.cuotas?.length || 1;
               const proxCuota = d.cuotas?.find((c: any) => c.estado === 'PENDIENTE');

               return (
                 <div key={d.id} className="p-3 bg-slate-50 rounded-md border border-slate-200 flex flex-col gap-2">
                   <div className="flex justify-between">
                     <div>
                       <span className="font-bold text-[#0F3160] block">{d.nombre}</span>
                       <span className="text-slate-500 text-sm">
                         Progreso: {pagadas} / {totales} cuotas
                       </span>
                     </div>
                     <span className="font-bold text-danger">{Number(d.montoTotal).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
                   </div>
                   {proxCuota && (
                     <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                       <span className="text-sm text-slate-500">
                         Próximo: {new Date(proxCuota.fechaVencimiento).toLocaleDateString()} ({Number(proxCuota.monto).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })})
                       </span>
                       <button 
                         className="btn-primary px-3 py-1 text-xs" 
                         onClick={async () => {
                           await fetch(`/api/cuotas/${proxCuota.id}`, { method: 'PATCH', body: JSON.stringify({ estado: 'PAGADA' }) });
                           fetchData();
                         }}
                       >
                         Pagar
                       </button>
                     </div>
                   )}
                 </div>
               );
             })
            }
          </div>
        </div>
      </div>
    </div>
  );
}
