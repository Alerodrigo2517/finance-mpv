'use client';
import { useState } from 'react';
import { Vehiculo } from '@/types';
import { Settings, Wrench, Fuel, Plus, AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';

interface Props {
  vehiculo: Vehiculo;
  onRefresh: () => void;
  onAddComponente: (data: { tipoComponente: string; kmVidaUtil: number; kmUltimoCambio: number; fechaUltimoCambio: string }) => Promise<void>;
  onAddReparacion: (data: { fecha: string; descripcion: string; costo: number; taller: string }) => Promise<void>;
  onAddCombustible: (data: { fecha: string; litros: number; costoTotal: number; precioLitro?: number; kilometrajeMomento?: number }) => Promise<void>;
}

export default function VehiculoDetailView({ vehiculo, onRefresh, onAddComponente, onAddReparacion, onAddCombustible }: Props) {
  const [activeTab, setActiveTab] = useState<'MANTENIMIENTO' | 'REPARACIONES' | 'COMBUSTIBLE'>('MANTENIMIENTO');

  const tabs = [
    { id: 'MANTENIMIENTO', label: 'Mantenimiento', icon: Settings },
    { id: 'REPARACIONES', label: 'Reparaciones', icon: Wrench },
    { id: 'COMBUSTIBLE', label: 'Combustible', icon: Fuel },
  ];

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReparacionModal, setShowReparacionModal] = useState(false);
  const [showCombustibleModal, setShowCombustibleModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states Componente
  const [tipo, setTipo] = useState('');
  const [vidaUtil, setVidaUtil] = useState('');
  const [kmCambio, setKmCambio] = useState('');
  const [fecha, setFecha] = useState('');

  // Form states Reparacion
  const [repFecha, setRepFecha] = useState('');
  const [repDesc, setRepDesc] = useState('');
  const [repCosto, setRepCosto] = useState('');
  const [repTaller, setRepTaller] = useState('');

  // Form states Combustible
  const [combFecha, setCombFecha] = useState('');
  const [combLitros, setCombLitros] = useState('');
  const [combCosto, setCombCosto] = useState('');
  const [combPrecio, setCombPrecio] = useState('');
  const [combKm, setCombKm] = useState('');

  const handleSubmitComponente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipo || !vidaUtil || !kmCambio || !fecha) return;
    setIsSubmitting(true);
    try {
      await onAddComponente({ tipoComponente: tipo, kmVidaUtil: parseInt(vidaUtil, 10), kmUltimoCambio: parseInt(kmCambio, 10), fechaUltimoCambio: fecha });
      setShowAddModal(false); setTipo(''); setVidaUtil(''); setKmCambio(''); setFecha('');
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  const handleSubmitReparacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repFecha || !repDesc || !repCosto) return;
    setIsSubmitting(true);
    try {
      await onAddReparacion({ fecha: repFecha, descripcion: repDesc, costo: parseFloat(repCosto), taller: repTaller });
      setShowReparacionModal(false); setRepFecha(''); setRepDesc(''); setRepCosto(''); setRepTaller('');
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  const handleSubmitCombustible = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!combFecha || !combLitros || !combCosto) return;
    setIsSubmitting(true);
    try {
      await onAddCombustible({ 
        fecha: combFecha, 
        litros: parseFloat(combLitros), 
        costoTotal: parseFloat(combCosto), 
        precioLitro: combPrecio ? parseFloat(combPrecio) : undefined, 
        kilometrajeMomento: combKm ? parseInt(combKm, 10) : undefined 
      });
      setShowCombustibleModal(false); setCombFecha(''); setCombLitros(''); setCombCosto(''); setCombPrecio(''); setCombKm('');
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      {/* Header Profile */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/3 -translate-y-1/3"></div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-blue-100 text-[#0F3160] px-3 py-1 rounded-lg text-xs font-bold tracking-widest uppercase">
              {vehiculo.anio}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F3160] tracking-tight">
            {vehiculo.marca} {vehiculo.modelo}
          </h2>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            Kilometraje Actual: <span className="font-bold text-slate-800">{vehiculo.kilometrajeActual?.toLocaleString()} km</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mt-6 mb-6 overflow-x-auto no-scrollbar shadow-inner">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white text-[#0F3160] shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative">
        
        {/* MANTENIMIENTO TAB */}
        {activeTab === 'MANTENIMIENTO' && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-xl text-slate-800">Componentes</h3>
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 text-sm font-bold bg-[#0F3160] text-white px-4 py-2 rounded-xl hover:bg-[#0a244a] shadow-sm transition-all">
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!vehiculo.componentes || vehiculo.componentes.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-400 font-medium">No hay componentes registrados.</div>
              ) : (
                vehiculo.componentes.map(c => {
                  const kmParaCambio = ((c.kmUltimoCambio || 0) + (c.kmVidaUtil || 0)) - (vehiculo.kilometrajeActual || 0);
                  const isDanger = kmParaCambio < 0;
                  const isWarning = kmParaCambio >= 0 && kmParaCambio <= 2000;
                  return (
                    <div key={c.id} className="border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-800">{c.tipoComponente}</span>
                          <span className="text-xs text-slate-500 font-medium mt-1">Vida útil: {(c.kmVidaUtil || 0).toLocaleString()} km</span>
                        </div>
                        {isDanger ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Vencido</span>
                        ) : isWarning ? (
                          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Pronto</span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ok</span>
                        )}
                      </div>
                      
                      <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center mt-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Restante</span>
                        <span className={`font-extrabold ${isDanger ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {isDanger ? `-${Math.abs(kmParaCambio).toLocaleString()}` : kmParaCambio.toLocaleString()} km
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* REPARACIONES TAB */}
        {activeTab === 'REPARACIONES' && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-xl text-slate-800">Historial de Reparaciones</h3>
              <button onClick={() => setShowReparacionModal(true)} className="flex items-center gap-2 text-sm font-bold bg-[#0F3160] text-white px-4 py-2 rounded-xl hover:bg-[#0a244a] shadow-sm transition-all">
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {!vehiculo.reparaciones || vehiculo.reparaciones.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">No hay reparaciones registradas.</div>
              ) : (
                vehiculo.reparaciones.map(r => (
                  <div key={r.id} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-800">{r.descripcion}</span>
                      <span className="text-xs text-slate-500">{new Date(r.fecha).toLocaleDateString('es-AR')} • {r.taller || 'Taller no especificado'}</span>
                    </div>
                    <span className="font-extrabold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-sm">
                      -${r.costo.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* COMBUSTIBLE TAB */}
        {activeTab === 'COMBUSTIBLE' && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-xl text-slate-800">Cargas de Combustible</h3>
              <button onClick={() => setShowCombustibleModal(true)} className="flex items-center gap-2 text-sm font-bold bg-[#0F3160] text-white px-4 py-2 rounded-xl hover:bg-[#0a244a] shadow-sm transition-all">
                <Plus className="w-4 h-4" /> Carga
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!vehiculo.combustibles || vehiculo.combustibles.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">No hay cargas de combustible registradas.</div>
              ) : (
                vehiculo.combustibles.map(c => (
                  <div key={c.id} className="border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{new Date(c.fecha).toLocaleDateString('es-AR')}</span>
                        {c.kilometraje_momento && <span className="text-xs text-slate-500 font-medium mt-0.5">{c.kilometraje_momento.toLocaleString()} km</span>}
                      </div>
                      <span className="font-extrabold text-red-600 bg-red-50 px-3 py-1 rounded-lg text-sm">
                        -${c.costo_total.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col items-center flex-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Litros</span>
                        <span className="font-bold text-slate-700">{c.litros} L</span>
                      </div>
                      <div className="w-px h-8 bg-slate-200"></div>
                      <div className="flex flex-col items-center flex-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precio / L</span>
                        <span className="font-bold text-slate-700">{c.precio_litro ? `$${c.precio_litro}` : '-'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Component Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-lg text-[#0F3160]">Nuevo Componente</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm p-2 rounded-full transition-all"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmitComponente} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600">Tipo (Ej. Aceite)</label><input type="text" value={tipo} onChange={(e) => setTipo(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600">Vida útil en km</label><input type="number" value={vidaUtil} onChange={(e) => setVidaUtil(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600">Km al cambiarlo</label><input type="number" value={kmCambio} onChange={(e) => setKmCambio(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600">Fecha de cambio</label><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" /></div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#0F3160] hover:bg-[#0a244a] text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-2 flex justify-center items-center gap-2">{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Reparacion Modal */}
      {showReparacionModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-lg text-[#0F3160]">Nueva Reparación</h3>
              <button onClick={() => setShowReparacionModal(false)} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm p-2 rounded-full transition-all"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmitReparacion} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600">Descripción</label><input type="text" placeholder="Ej. Cambio de frenos" value={repDesc} onChange={(e) => setRepDesc(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600">Fecha</label><input type="date" value={repFecha} onChange={(e) => setRepFecha(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600">Costo ($)</label><input type="number" placeholder="Ej. 15000" value={repCosto} onChange={(e) => setRepCosto(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" /></div>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600">Taller Mecánico (Opcional)</label><input type="text" placeholder="Ej. Taller Los Amigos" value={repTaller} onChange={(e) => setRepTaller(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" /></div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#0F3160] hover:bg-[#0a244a] text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-2 flex justify-center items-center gap-2">{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Combustible Modal */}
      {showCombustibleModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-lg text-[#0F3160]">Carga Combustible</h3>
              <button onClick={() => setShowCombustibleModal(false)} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm p-2 rounded-full transition-all"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmitCombustible} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600">Fecha</label><input type="date" value={combFecha} onChange={(e) => setCombFecha(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600">Litros</label><input type="number" step="0.1" placeholder="Ej. 45.5" value={combLitros} onChange={(e) => setCombLitros(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600">Costo Total ($)</label><input type="number" placeholder="Ej. 35000" value={combCosto} onChange={(e) => setCombCosto(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600">Precio x Litro (Opcional)</label><input type="number" placeholder="Ej. 750" value={combPrecio} onChange={(e) => setCombPrecio(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" /></div>
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600">Kilometraje en la carga (Opcional)</label><input type="number" placeholder="Para medir consumo" value={combKm} onChange={(e) => setCombKm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" /></div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#0F3160] hover:bg-[#0a244a] text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-2 flex justify-center items-center gap-2">{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Carga'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
