'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Receipt, Loader2, UploadCloud, FileText, Download, ExternalLink, Trash2, Camera, X, DollarSign, Calendar, Zap, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import BarcodeScanner from '@/components/BarcodeScanner';
import FacturasList from '@/components/FacturasList';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import BlankState from '@/components/ui/BlankState';
import ServiciosMasterView from '@/components/servicios/ServiciosMasterView';
import ServicioDetailView from '@/components/servicios/ServicioDetailView';

import { Servicio, Factura } from '@/types';

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [tiposServicios, setTiposServicios] = useState<{id: string, nombre: string}[]>([]);
  const [loading, setLoading] = useState(true);

  // Master-Detail State
  const [selectedServicioId, setSelectedServicioId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [deleteTarget, setDeleteTarget] = useState<{type: 'servicio' | 'factura', id: string} | null>(null);

  // States for Modals/Forms
  const [showServicioForm, setShowServicioForm] = useState(false);
  const [sNombre, setSNombre] = useState('');
  const [sCuenta, setSCuenta] = useState('');
  const [sMedidor, setSMedidor] = useState('');
  const [sMonto, setSMonto] = useState('');
  const [sVencimiento, setSVencimiento] = useState('');

  // Modals and Forms states remain here...

  // Edit Factura State
  const [editingFactura, setEditingFactura] = useState<Factura | null>(null);
  const [eF_Monto, setEF_Monto] = useState('');
  const [eF_Vencimiento, setEF_Vencimiento] = useState('');
  const [eF_Periodo, setEF_Periodo] = useState('');
  const [eF_Consumo, setEF_Consumo] = useState('');
  const [editStatus, setEditStatus] = useState<{status: 'idle'|'loading'|'error'|'success', message: string}>({status: 'idle', message: ''});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const showError = (msg: string) => {
    setGlobalError(msg);
    setTimeout(() => setGlobalError(null), 3000);
  };

  const fetchData = async () => {
    try {
      const [resS, resTS] = await Promise.all([
        fetch('/api/servicios'),
        fetch('/api/tipos-servicios')
      ]);
      
      if (resS.ok) {
        const data = await resS.json();
        setServicios(data);
      }
      if (resTS.ok) {
        const dataTS = await resTS.json();
        setTiposServicios(dataTS);
      }
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
        body: JSON.stringify({ nombre: sNombre, nroCuenta: sCuenta, nroMedidor: sMedidor, monto: sMonto, vencimiento: sVencimiento }),
      });
      if (res.ok) {
        setSNombre(''); setSCuenta(''); setSMedidor(''); setSMonto(''); setSVencimiento('');
        setShowServicioForm(false);
        fetchData();
      } else {
        const data = await res.json();
        showError(data.error || 'Error al crear servicio');
      }
    } catch (e) {
      console.error(e);
      showError('Error de conexión');
    }
  };

  // Upload handlers moved to UploadFacturaForm.tsx

  const handleDeleteServicio = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteTarget({ type: 'servicio', id });
  };

  const handleDeleteFactura = (id: string) => {
    setDeleteTarget({ type: 'factura', id });
  };

  const handlePayFactura = async (id: string, metodoPago?: string) => {
    try {
      const payload: any = { estado: 'PAGADA' };
      if (metodoPago) {
        payload.metodo_pago = metodoPago;
      }
      
      const res = await fetch(`/api/facturas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchData();
      } else {
        showError('Error al marcar factura como pagada');
      }
    } catch (e) {
      showError('Error de conexión');
    }
  };

  const handleEditFacturaClick = (f: Factura) => {
    setEditingFactura(f);
    setEF_Monto(f.monto.toString());
    const pDesde = f.periodoDesde || f.periodo_desde;
    const fVenc = f.fechaVencimiento || f.fecha_vencimiento;
    setEF_Vencimiento(fVenc ? fVenc.split('T')[0] : '');
    setEF_Periodo(pDesde ? pDesde.split('T')[0].substring(0, 7) : ''); // Format to YYYY-MM
    setEF_Consumo(f.kwConsumidos?.toString() || '');
  };

  const handleEditFacturaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFactura) return;
    try {
      setEditStatus({status: 'loading', message: 'Guardando cambios...'});
      
      const payload: any = {};
      if (eF_Monto) payload.monto = eF_Monto;
      if (eF_Consumo) payload.kwConsumidos = eF_Consumo;
      if (eF_Vencimiento) payload.fechaVencimiento = eF_Vencimiento;
      if (eF_Periodo) {
        // Construct full date string for period
        const [year, month] = eF_Periodo.split('-');
        payload.periodoDesde = `${year}-${month}-01T00:00:00.000Z`;
        payload.periodoHasta = `${year}-${month}-28T00:00:00.000Z`;
      }
      
      const res = await fetch(`/api/facturas/${editingFactura.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setEditStatus({status: 'success', message: 'Factura actualizada'});
        setTimeout(() => {
          setEditStatus({status: 'idle', message: ''});
          setEditingFactura(null);
        }, 1500);
        fetchData();
      } else {
        throw new Error();
      }
    } catch (err) {
      setEditStatus({status: 'error', message: 'Error al actualizar la factura'});
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    if (deleteTarget.type === 'servicio') {
      const res = await fetch(`/api/servicios/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedServicioId === deleteTarget.id) setSelectedServicioId(null);
        fetchData();
      } else {
        throw new Error('Error al eliminar el servicio');
      }
    } else {
      const res = await fetch(`/api/facturas/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        throw new Error('Error al eliminar la factura');
      }
    }
  };

  // handleUploadFile moved to UploadFacturaForm.tsx

  // Calculations for Master View
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  let facturadoMesTotal = 0;
  let pagadoMesTotal = 0;
  let pendientePagoTotal = 0;

  servicios.forEach(s => {
    if (s.facturas) {
      s.facturas.forEach(f => {
        const dStr = f.fechaVencimiento || f.fecha_vencimiento || '';
        const fMonth = dStr ? parseInt(dStr.split('T')[0].split('-')[1], 10) - 1 : -1;
        const fYear = dStr ? parseInt(dStr.split('T')[0].split('-')[0], 10) : -1;
        
        if (fMonth === currentMonth && fYear === currentYear) {
          facturadoMesTotal += Number(f.monto);
          if (f.estado !== 'PENDIENTE') {
            pagadoMesTotal += Number(f.monto);
          }
        }
        if (f.estado === 'PENDIENTE') {
          pendientePagoTotal += Number(f.monto);
        }
      });
    }
  });

  const selectedServicio = servicios.find(s => s.id === selectedServicioId);

  // Calculations for Detail View
  let gastoAnoServicio = 0;
  let pendientePagoServicio = 0;
  let consumosAnuales: number[] = [];

  if (selectedServicio?.facturas) {
    selectedServicio.facturas.forEach(f => {
      const dStr = f.fechaVencimiento || f.fecha_vencimiento || '';
      const fYear = dStr ? parseInt(dStr.split('T')[0].split('-')[0], 10) : -1;
      
      if (fYear === selectedYear) {
        gastoAnoServicio += Number(f.monto);
      }
      if (f.estado === 'PENDIENTE') {
        pendientePagoServicio += Number(f.monto);
      }
      if (fYear === selectedYear && (f.kwConsumidos || (f as any).kw_consumidos)) {
        consumosAnuales.push(Number(f.kwConsumidos || (f as any).kw_consumidos));
      }
    });
  }
  
  const sortedFacturas = selectedServicio?.facturas ? 
    [...selectedServicio.facturas]
      .filter(f => {
        const dStr = f.fechaVencimiento || f.fecha_vencimiento || '';
        const fYear = dStr ? parseInt(dStr.split('T')[0].split('-')[0], 10) : -1;
        return fYear === selectedYear;
      })
      .sort((a,b)=> new Date(b.fechaVencimiento || b.fecha_vencimiento || '').getTime() - new Date(a.fechaVencimiento || a.fecha_vencimiento || '').getTime()) 
    : [];

  const availableYears = Array.from(new Set(
    (selectedServicio?.facturas || []).map(f => {
      const dStr = f.fechaVencimiento || f.fecha_vencimiento || '';
      return dStr ? parseInt(dStr.split('T')[0].split('-')[0], 10) : new Date().getFullYear();
    })
  )).sort((a, b) => b - a);
  if (!availableYears.includes(new Date().getFullYear())) {
    availableYears.push(new Date().getFullYear());
    availableYears.sort((a, b) => b - a);
  }

  return (
    <div className="min-h-[calc(100vh-100px)] font-sans flex flex-col -m-4 sm:-m-8 p-4 sm:p-8">
      
      {/* HEADER TIPO APP */}
      <div className="flex justify-between items-center mb-8 pt-2 shrink-0">
        <div className="flex items-center gap-2">
          {selectedServicioId && (
            <button onClick={() => setSelectedServicioId(null)} className="text-slate-600 hover:text-slate-900 transition-colors mr-2 bg-slate-100 p-1 rounded-full hover:bg-slate-200">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-bold text-[#0F3160] uppercase tracking-wide">
            {selectedServicioId ? (selectedServicio?.nombreProveedor || selectedServicio?.nombre_proveedor || 'Servicio') : 'Gestion de Servicios'}
          </h1>
        </div>
        <div className="flex gap-2 items-center">
          {!selectedServicioId && (
            <button 
              onClick={() => setShowServicioForm(true)}
              className="flex items-center gap-1.5 bg-[#0F3160] hover:bg-[#0a244a] text-white text-xs font-bold uppercase px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Nuevo Servicio</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <Loader2 className="w-8 h-8 text-[#0F3160] animate-spin" />
        </div>
      ) : (
        <div className="flex-1 w-full">
          
          {/* VISTA PRINCIPAL (Lista de Servicios) */}
          {!selectedServicioId ? (
            <ServiciosMasterView 
              servicios={servicios}
              facturadoMesTotal={facturadoMesTotal}
              pagadoMesTotal={pagadoMesTotal}
              pendientePagoTotal={pendientePagoTotal}
              selectedServicioId={selectedServicioId}
              setSelectedServicioId={setSelectedServicioId}
              setShowServicioForm={setShowServicioForm}
              handleDeleteServicio={handleDeleteServicio}
            />
          ) : (
          /* VISTA DETALLE (Un solo servicio) */
            selectedServicio ? (
              <ServicioDetailView 
                selectedServicio={selectedServicio as Servicio}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                gastoAnoServicio={gastoAnoServicio}
                pendientePagoServicio={pendientePagoServicio}
                consumosAnuales={consumosAnuales}
                availableYears={availableYears}
                sortedFacturas={sortedFacturas as Factura[]}
                handleDeleteFactura={handleDeleteFactura}
                handlePayFactura={handlePayFactura}
                handleEditFacturaClick={handleEditFacturaClick}
                fetchData={fetchData}
              />
            ) : null
          )}

        </div>
      )}
      <ConfirmDeleteDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={deleteTarget?.type === 'servicio' ? "¿Eliminar servicio?" : "¿Eliminar factura?"}
        description={deleteTarget?.type === 'servicio' 
          ? "¿Estás seguro de que deseas eliminar este servicio y TODAS sus facturas? Esta acción no se puede deshacer."
          : "¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede deshacer."}
      />

      {/* Modal Alta de Servicio */}
      {showServicioForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleServicioSubmit} className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200 max-w-sm w-full relative">
            <button type="button" onClick={() => setShowServicioForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-2 mt-2">
              <h4 className="font-bold text-[#0F3160] text-xl">Alta de Servicio</h4>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nombre del Servicio <span className="text-red-500">*</span></label>
              <select 
                value={sNombre} 
                onChange={(e) => setSNombre(e.target.value)} 
                required 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 text-slate-900 cursor-pointer"
              >
                <option value="" disabled>Seleccione un servicio</option>
                <optgroup label="Comunes">
                  <option value="Luz">Luz</option>
                  <option value="Gas">Gas</option>
                  <option value="Agua">Agua</option>
                  <option value="Internet">Internet</option>
                  <option value="TV">TV</option>
                  <option value="Internet y TV">Internet y TV</option>
                  <option value="Impuestos">Impuestos</option>
                  <option value="Celular">Celular</option>
                  <option value="Seguro">Seguro</option>
                  <option value="Alquiler">Alquiler</option>
                  <option value="Expensas">Expensas</option>
                </optgroup>
                {tiposServicios.length > 0 && (
                  <optgroup label="Personalizados">
                    {tiposServicios.map(ts => (
                      <option key={ts.id} value={ts.nombre}>{ts.nombre}</option>
                    ))}
                  </optgroup>
                )}
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={() => setShowServicioForm(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors font-bold py-3.5 rounded-xl">Cancelar</button>
              <button type="submit" className="flex-1 bg-[#0F3160] hover:bg-[#0a244a] transition-colors text-white font-bold py-3.5 rounded-xl shadow-md">Crear</button>
            </div>
          </form>
        </div>
      )}

      {globalError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-medium z-[200] animate-in slide-in-from-bottom-2 duration-300">
          {globalError}
        </div>
      )}
    </div>
  );
}
