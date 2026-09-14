'use client';
import { useState } from 'react';
import { Car, Plus, ChevronRight, X, Loader2 } from 'lucide-react';
import { Vehiculo } from '@/types';

interface Props {
  vehiculos: Vehiculo[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (data: { marca: string; modelo: string; anio: number; kilometrajeActual: number }) => Promise<void>;
}

export default function VehiculosMasterView({ vehiculos, selectedId, onSelect, onAdd }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [km, setKm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marca || !modelo || !anio || !km) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onAdd({ 
        marca, 
        modelo, 
        anio: parseInt(anio, 10), 
        kilometrajeActual: parseInt(km, 10) 
      });
      setShowForm(false);
      setMarca('');
      setModelo('');
      setAnio('');
      setKm('');
    } catch (error) {
      setErrorMsg('Ocurrió un error al guardar el vehículo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white md:bg-transparent">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-100 md:border-none md:pb-2">
        <h2 className="font-extrabold text-xl text-[#0F3160] flex items-center gap-2">
          <Car className="w-5 h-5 text-primary" /> Vehículos
        </h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-50 text-[#0F3160] hover:bg-blue-100 p-2 rounded-xl transition-colors"
          title="Agregar vehículo"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 md:px-0 md:pt-2 flex flex-col gap-2">
        {vehiculos.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Car className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No hay vehículos registrados</p>
            <p className="text-xs text-slate-400 mt-1">Añade tu auto o moto para comenzar</p>
          </div>
        ) : (
          vehiculos.map(v => {
            const isSelected = selectedId === v.id;
            return (
              <button
                key={v.id}
                onClick={() => onSelect(v.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all border flex items-center gap-4 ${
                  isSelected 
                    ? 'bg-[#0F3160] border-[#0F3160] text-white shadow-lg md:scale-105 origin-left' 
                    : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md hover:bg-blue-50/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20' : 'bg-slate-100'}`}>
                  <Car className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-[#0F3160]'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {v.marca} {v.modelo}
                  </h3>
                  <p className={`text-xs mt-0.5 truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    Año {v.anio} • {v.kilometrajeActual?.toLocaleString()} km
                  </p>
                </div>
                <ChevronRight className={`w-5 h-5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-300'}`} />
              </button>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-lg text-[#0F3160]">Nuevo Vehículo</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm p-2 rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Marca</label>
                  <input type="text" placeholder="Ej. Ford" value={marca} onChange={(e) => setMarca(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Modelo</label>
                  <input type="text" placeholder="Ej. Fiesta" value={modelo} onChange={(e) => setModelo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Año</label>
                  <input type="number" placeholder="Ej. 2018" value={anio} onChange={(e) => setAnio(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Kilometraje</label>
                  <input type="number" placeholder="Ej. 45000" value={km} onChange={(e) => setKm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 transition-all" />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-500 font-medium text-center bg-red-50 py-2 rounded-lg mt-2 animate-in fade-in">
                  {errorMsg}
                </p>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#0F3160] hover:bg-[#0a244a] text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-4 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Vehículo'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
