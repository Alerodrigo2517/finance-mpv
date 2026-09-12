'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Receipt, Loader2, UploadCloud, FileText, Download, ExternalLink, Trash2, Camera } from 'lucide-react';
import Link from 'next/link';
import BarcodeScanner from '@/components/BarcodeScanner';
import FacturasList from '@/components/FacturasList';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';

import { Servicio, Factura } from '@/types';

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  // Master-Detail State
  const [selectedServicioId, setSelectedServicioId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'servicio' | 'factura', id: string} | null>(null);

  // States for Modals/Forms
  const [showServicioForm, setShowServicioForm] = useState(false);
  const [sNombre, setSNombre] = useState('');
  const [sCuenta, setSCuenta] = useState('');
  const [sMedidor, setSMedidor] = useState('');
  const [sMonto, setSMonto] = useState('');
  const [sVencimiento, setSVencimiento] = useState('');

  // AI Upload State (Inside Detail view)
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTab, setUploadTab] = useState<'manual' | 'archivo' | 'escaner'>('manual');
  const [uploadStatus, setUploadStatus] = useState<{status: 'idle'|'loading'|'error'|'success', message: string}>({status: 'idle', message: ''});
  const [uploadResult, setUploadResult] = useState<Partial<Factura> & { kwConsumidos?: number, fechaEmision?: string, proximaFechaVencimiento?: string } | null>(null);

  // Manual Factura State
  const [mF_Monto, setMF_Monto] = useState('');
  const [mF_Vencimiento, setMF_Vencimiento] = useState('');
  const [mF_Periodo, setMF_Periodo] = useState('');
  const [mF_Consumo, setMF_Consumo] = useState('');

  const fetchData = async () => {
    try {
      const resS = await fetch('/api/servicios');
      if (resS.ok) {
        const data = await resS.json();
        setServicios(data);
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
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGuardarFacturaIA = async (servicioId: string) => {
    if (!uploadResult) return;
    try {
      setUploadStatus({status: 'loading', message: 'Guardando datos...'});

      const resFactura = await fetch('/api/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servicioId: servicioId,
          monto: uploadResult.monto,
          fechaVencimiento: uploadResult.fechaVencimiento,
          periodoDesde: uploadResult.periodoDesde || uploadResult.fechaVencimiento,
          periodoHasta: uploadResult.periodoHasta || uploadResult.fechaVencimiento,
          fechaEmision: uploadResult.fechaEmision,
          proximaFechaVencimiento: uploadResult.proximaFechaVencimiento,
          kwConsumidos: uploadResult.kwConsumidos,
          archivoUrl: uploadResult.archivoUrl
        })
      });

      if (resFactura.ok) {
        setUploadResult(null);
        setShowUpload(false);
        setUploadStatus({status: 'success', message: 'Guardado con éxito'});
        setTimeout(() => setUploadStatus({status: 'idle', message: ''}), 2000);
        fetchData();
      } else {
        throw new Error("No se pudo guardar la factura");
      }
    } catch (e) {
      setUploadStatus({status: 'error', message: 'Ocurrió un error al guardar los datos.'});
    }
  };

  const handleGuardarManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServicioId) return;
    try {
      setUploadStatus({status: 'loading', message: 'Guardando factura...'});
      const res = await fetch('/api/facturas/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servicioId: selectedServicioId,
          monto: mF_Monto,
          fechaVencimiento: mF_Vencimiento,
          periodoDesde: mF_Periodo,
          periodoHasta: mF_Periodo,
          kwConsumidos: mF_Consumo,
        })
      });
      if (res.ok) {
        setUploadStatus({status: 'success', message: 'Guardado con éxito'});
        setMF_Monto(''); setMF_Vencimiento(''); setMF_Periodo(''); setMF_Consumo('');
        setTimeout(() => {
          setUploadStatus({status: 'idle', message: ''});
          setShowUpload(false);
        }, 2000);
        fetchData();
      } else {
        throw new Error();
      }
    } catch(e) {
      setUploadStatus({status: 'error', message: 'Error al guardar factura manual.'});
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    // Por ahora prellenamos el formulario manual y pasamos a esa tab
    alert('Código leído correctamente. Continúa con la carga manual.');
    setUploadTab('manual');
  };

  const handleDeleteServicio = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteTarget({ type: 'servicio', id });
  };

  const handleDeleteFactura = (id: string) => {
    setDeleteTarget({ type: 'factura', id });
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

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadStatus({status: 'loading', message: 'Analizando con IA y guardando...'});
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      const res = await fetch('/api/facturas/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setUploadResult(data.parsedData);
        setUploadStatus({status: 'idle', message: ''});
      } else {
        setUploadStatus({status: 'error', message: 'Error al procesar. Reintenta.'});
      }
    } catch (err) {
      setUploadStatus({status: 'error', message: 'Error de red.'});
    } finally {
      e.target.value = '';
    }
  };

  // Calculations for Master View
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  let gastoMesTotal = 0;
  let pendientePagoTotal = 0;

  servicios.forEach(s => {
    if (s.facturas) {
      s.facturas.forEach(f => {
        const dStr = f.fechaVencimiento || '';
        const fMonth = dStr ? parseInt(dStr.split('T')[0].split('-')[1], 10) - 1 : -1;
        const fYear = dStr ? parseInt(dStr.split('T')[0].split('-')[0], 10) : -1;
        
        if (fMonth === currentMonth && fYear === currentYear && f.estado !== 'PENDIENTE') {
          gastoMesTotal += Number(f.monto);
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
      const dStr = f.fechaVencimiento || '';
      const fYear = dStr ? parseInt(dStr.split('T')[0].split('-')[0], 10) : -1;
      
      if (fYear === currentYear && f.estado !== 'PENDIENTE') {
        gastoAnoServicio += Number(f.monto);
      }
      if (f.estado === 'PENDIENTE') {
        pendientePagoServicio += Number(f.monto);
      }
      if (fYear === currentYear && f.kwConsumidos) {
        consumosAnuales.push(Number(f.kwConsumidos));
      }
    });
  }
  
  const sortedFacturas = selectedServicio?.facturas ? [...selectedServicio.facturas].sort((a,b)=> new Date(b.fechaVencimiento || '').getTime() - new Date(a.fechaVencimiento || '').getTime()) : [];

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
          <h1 className="text-xl font-bold text-[#0F3160] uppercase tracking-wide">Gestion de Servicios</h1>
        </div>
        <div className="flex gap-2">
          <button className="text-xs font-bold uppercase border border-slate-300 bg-white text-slate-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50">
            Importar
          </button>
          <button className="text-xs font-bold uppercase border border-slate-300 bg-white text-slate-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50">
            Exportar
          </button>
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
            <div className="flex flex-col gap-6 w-full animate-in fade-in zoom-in-95 duration-200">
            
            {/* Top Summaries Left */}
            <div className="flex justify-center gap-3 sm:gap-6">
              <div className="bg-white border-2 border-slate-200 rounded-2xl px-3 sm:px-6 py-4 flex flex-col items-center justify-center flex-1 sm:flex-none sm:min-w-[140px] shadow-sm text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Gasto Mes</span>
                <span className="text-lg sm:text-xl font-black text-slate-800">{gastoMesTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-white border-2 border-slate-200 rounded-2xl px-3 sm:px-6 py-4 flex flex-col items-center justify-center flex-1 sm:flex-none sm:min-w-[140px] shadow-sm text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pendiente</span>
                <span className="text-lg sm:text-xl font-black text-slate-800">{pendientePagoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* List of Services */}
            <div className="flex flex-col gap-4 mt-2">
              {servicios.map(s => {
                const fs = s.facturas ? [...s.facturas].sort((a,b)=> new Date(b.fechaVencimiento || '').getTime() - new Date(a.fechaVencimiento || '').getTime()) : [];
                const ultimaFactura = fs[0];
                const isSelected = selectedServicioId === s.id;

                return (
                  <div 
                    key={s.id} 
                    onClick={() => setSelectedServicioId(s.id)}
                    className={`bg-white border-2 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-[#0F3160] ring-4 ring-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="flex justify-end mb-2">
                      <span className="font-black text-slate-800 text-lg">
                        {ultimaFactura ? Number(ultimaFactura.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '0,00'}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-slate-800 text-xl tracking-wide">{s.nombreProveedor}</span>
                      <div className="flex gap-2">
                        {ultimaFactura && ultimaFactura.estado === 'PENDIENTE' ? (
                          <div className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold uppercase">Pendiente</div>
                        ) : (
                          <div className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-bold uppercase">Pagado</div>
                        )}
                        <button onClick={(e) => handleDeleteServicio(e, s.id)} className="px-3 py-1 bg-white text-red-500 border border-red-500 rounded-lg text-xs font-bold uppercase hover:bg-red-50 transition-colors">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button 
                onClick={() => setShowServicioForm(!showServicioForm)}
                className="w-full bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 text-slate-600 font-bold py-4 rounded-2xl transition-colors flex justify-center items-center gap-2 mt-2"
              >
                <Plus className="w-5 h-5" /> Agregar Nuevo Servicio
              </button>

              {showServicioForm && (
                <form onSubmit={handleServicioSubmit} className="flex flex-col gap-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in zoom-in duration-200">
                  <h4 className="font-bold text-[#0F3160] mb-2 text-center">Nuevo Servicio y Factura Inicial</h4>
                  <input type="text" placeholder="Nombre de servicio (Ej. EDEA)" value={sNombre} onChange={(e) => setSNombre(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 text-slate-900 placeholder:text-slate-400" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" step="0.01" placeholder="Monto ($)" value={sMonto} onChange={(e) => setSMonto(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 text-slate-900 placeholder:text-slate-400" />
                    <input type="date" value={sVencimiento} onChange={(e) => setSVencimiento(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 text-slate-900 placeholder:text-slate-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Cuenta (Opcional)" value={sCuenta} onChange={(e) => setSCuenta(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 text-slate-900 placeholder:text-slate-400" />
                    <input type="text" placeholder="Medidor (Opcional)" value={sMedidor} onChange={(e) => setSMedidor(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 text-slate-900 placeholder:text-slate-400" />
                  </div>
                  <button type="submit" className="w-full bg-[#0F3160] text-white font-bold py-3 rounded-xl mt-2 shadow-md">Guardar</button>
                </form>
              )}
            </div>
          </div>
          ) : (
          /* VISTA DETALLE (Un solo servicio) */
          <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-right-8 duration-300">
                {/* Top Summaries Right */}
                <div className="flex justify-center gap-3 sm:gap-6">
                  <div className="bg-white border-2 border-slate-200 rounded-2xl px-3 sm:px-6 py-4 flex flex-col items-center justify-center flex-1 sm:flex-none sm:min-w-[160px] shadow-sm text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-center leading-tight">Gasto <br className="sm:hidden" />del año</span>
                    <span className="text-lg sm:text-xl font-black text-slate-800">{gastoAnoServicio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="bg-white border-2 border-slate-200 rounded-2xl px-3 sm:px-6 py-4 flex flex-col items-center justify-center flex-1 sm:flex-none sm:min-w-[140px] shadow-sm text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pendiente</span>
                    <span className="text-lg sm:text-xl font-black text-slate-800">{pendientePagoServicio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Consumo Anual Bar */}
                {consumosAnuales.length > 0 && (
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex flex-col items-center shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Consumo anual ({consumosAnuales.reduce((a,b)=>a+b,0)} kW)</span>
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

                <div className="flex justify-between items-center mt-2 px-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Todas las facturas de {currentYear} ({selectedServicio?.nombreProveedor})
                  </span>
                  <button 
                    onClick={() => setShowUpload(!showUpload)}
                    className="text-[10px] font-bold bg-[#0F3160] text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#0a244a] transition-colors"
                  >
                    + Cargar factura
                  </button>
                </div>

                {/* Upload Form */}
                {showUpload && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 animate-in slide-in-from-top-2">
                    
                    {/* TABS */}
                    <div className="flex bg-white rounded-lg p-1 border border-blue-200 mb-4 shadow-sm">
                      <button onClick={() => setUploadTab('manual')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${uploadTab === 'manual' ? 'bg-[#0F3160] text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>Manual</button>
                      <button onClick={() => setUploadTab('archivo')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${uploadTab === 'archivo' ? 'bg-[#0F3160] text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>Archivo</button>
                      <button onClick={() => setUploadTab('escaner')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${uploadTab === 'escaner' ? 'bg-[#0F3160] text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>Escáner</button>
                    </div>

                    {uploadTab === 'archivo' && (
                      <div className="animate-in fade-in zoom-in-95 duration-200">
                        {!uploadResult ? (
                          <label className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-[#0F3160]/20 rounded-xl bg-white hover:bg-blue-50/50 cursor-pointer transition-colors relative overflow-hidden">
                            <input 
                              type="file" 
                              accept="application/pdf,image/jpeg,image/png,image/webp"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                              disabled={uploadStatus.status === 'loading'}
                              onChange={handleUploadFile}
                            />
                            {uploadStatus.status === 'loading' ? (
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 text-[#0F3160] animate-spin" />
                                <span className="text-sm font-bold text-[#0F3160]">{uploadStatus.message}</span>
                              </div>
                            ) : uploadStatus.status === 'error' ? (
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-sm font-bold text-red-600">❌ {uploadStatus.message}</span>
                                <span className="text-xs text-slate-400">Toca para intentar de nuevo</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-center px-4">
                                <UploadCloud className="w-8 h-8 text-[#0F3160]/60" />
                                <span className="text-sm font-bold text-[#0F3160]">Toca aquí para subir PDF o Imagen</span>
                                <span className="text-[10px] text-slate-400">La IA extraerá automáticamente los datos</span>
                              </div>
                            )}
                          </label>
                        ) : (
                          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-bold text-slate-800 text-sm">Resumen detectado</span>
                              <span className="text-lg font-black text-slate-900">${uploadResult.monto}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-500 mb-4">
                               <div className="flex flex-col"><span>Vencimiento:</span><span className="font-bold text-slate-700">{uploadResult.fechaVencimiento}</span></div>
                               {uploadResult.kwConsumidos && <div className="flex flex-col"><span>Consumo:</span><span className="font-bold text-slate-700">{uploadResult.kwConsumidos} kW</span></div>}
                            </div>
                            <button onClick={() => handleGuardarFacturaIA(selectedServicio?.id || '')} className="w-full bg-[#0F3160] hover:bg-[#0a244a] text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2">
                              {uploadStatus.status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                              Confirmar y Guardar
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {uploadTab === 'escaner' && (
                      <div className="animate-in fade-in zoom-in-95 duration-200">
                        <BarcodeScanner onScanSuccess={handleScanSuccess} />
                        <p className="text-xs text-center text-slate-500 mt-4">Apunta la cámara al código de barras de la factura física. (Si no tienes cámara, selecciona Manual).</p>
                      </div>
                    )}

                    {uploadTab === 'manual' && (
                      <form onSubmit={handleGuardarManual} className="flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" step="0.01" placeholder="Monto ($)" value={mF_Monto} onChange={(e) => setMF_Monto(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 text-slate-900 placeholder:text-slate-400 shadow-sm" />
                          <input type="date" value={mF_Vencimiento} onChange={(e) => setMF_Vencimiento(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 text-slate-900 placeholder:text-slate-400 shadow-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="date" placeholder="Periodo (Opcional)" value={mF_Periodo} onChange={(e) => setMF_Periodo(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 text-slate-900 placeholder:text-slate-400 shadow-sm" />
                          <input type="number" step="0.01" placeholder="Consumo kW (Opcional)" value={mF_Consumo} onChange={(e) => setMF_Consumo(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 text-slate-900 placeholder:text-slate-400 shadow-sm" />
                        </div>
                        <button type="submit" disabled={uploadStatus.status === 'loading'} className="w-full bg-[#0F3160] hover:bg-[#0a244a] text-white font-bold py-3 rounded-xl shadow-md mt-2 transition-colors flex justify-center items-center gap-2">
                          {uploadStatus.status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Factura'}
                        </button>
                        {uploadStatus.status === 'success' && <p className="text-emerald-600 text-sm font-bold text-center mt-2">¡Guardado con éxito!</p>}
                        {uploadStatus.status === 'error' && <p className="text-red-600 text-sm font-bold text-center mt-2">{uploadStatus.message}</p>}
                      </form>
                    )}
                  </div>
                )}

                {/* List of Facturas for Detail */}
                <FacturasList 
                  facturas={sortedFacturas} 
                  nombreProveedor={selectedServicio?.nombreProveedor || ''} 
                  onDeleteFactura={handleDeleteFactura} 
                />

              </div>
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
    </div>
  );
}
