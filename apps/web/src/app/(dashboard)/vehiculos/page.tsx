'use client';
import { useState, useEffect, useCallback } from 'react';
import { Vehiculo } from '@/types';
import { Loader2 } from 'lucide-react';
import VehiculosMasterView from '@/components/vehiculos/VehiculosMasterView';
import VehiculoDetailView from '@/components/vehiculos/VehiculoDetailView';

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehiculoId, setSelectedVehiculoId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const showError = (msg: string) => {
    setGlobalError(msg);
    setTimeout(() => setGlobalError(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/vehiculos');
      if (res.ok) {
        const data = await res.json();
        setVehiculos(data);
      } else {
        showError('No se pudieron cargar los vehículos');
      }
    } catch (e) {
      console.error(e);
      showError('Error de conexión al cargar los vehículos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddVehiculo = async (data: { marca: string; modelo: string; anio: number; kilometrajeActual: number }) => {
    const res = await fetch('/api/vehiculos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchData();
    } else {
      throw new Error('Error al guardar');
    }
  };

  const handleAddComponente = async (vehiculoId: string, data: { tipoComponente: string; kmVidaUtil: number; kmUltimoCambio: number; fechaUltimoCambio: string }) => {
    const res = await fetch('/api/componentes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehiculoId, ...data })
    });
    if (res.ok) {
      await fetchData();
    } else {
      throw new Error('Error al agregar componente');
    }
  };

  const handleAddReparacion = async (vehiculoId: string, data: any) => {
    const res = await fetch('/api/reparaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehiculoId, ...data })
    });
    if (res.ok) {
      await fetchData();
    } else {
      throw new Error('Error al agregar reparación');
    }
  };

  const handleAddCombustible = async (vehiculoId: string, data: any) => {
    const res = await fetch('/api/combustible', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehiculoId, ...data })
    });
    if (res.ok) {
      await fetchData();
    } else {
      throw new Error('Error al agregar carga de combustible');
    }
  };

  const selectedVehiculo = vehiculos.find(v => v.id === selectedVehiculoId);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-[#0F3160] animate-spin" />
          <p className="text-slate-500 font-medium">Cargando vehículos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] gap-6 overflow-hidden animate-in fade-in duration-300">
      
      {/* Sidebar - Master View */}
      <div className={`w-full md:w-80 shrink-0 h-full flex flex-col ${selectedVehiculoId ? 'hidden md:flex' : 'flex'}`}>
        <VehiculosMasterView 
          vehiculos={vehiculos}
          selectedId={selectedVehiculoId}
          onSelect={setSelectedVehiculoId}
          onAdd={handleAddVehiculo}
        />
      </div>

      {/* Main Content - Detail View */}
      <div className={`flex-1 h-full min-w-0 ${!selectedVehiculoId ? 'hidden md:flex' : 'flex'}`}>
        {selectedVehiculo ? (
          <VehiculoDetailView 
            vehiculo={selectedVehiculo}
            onRefresh={fetchData}
            onAddComponente={(data) => handleAddComponente(selectedVehiculo.id, data)}
            onAddReparacion={(data) => handleAddReparacion(selectedVehiculo.id, data)}
            onAddCombustible={(data) => handleAddCombustible(selectedVehiculo.id, data)}
          />
        ) : (
          <div className="hidden md:flex w-full h-full items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-500">Selecciona un vehículo</h3>
              <p className="text-sm text-slate-400 mt-1">Elige un vehículo de la lista para ver sus detalles</p>
            </div>
          </div>
        )}
      </div>

      {/* Global Toast Error */}
      {globalError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-medium z-[200] animate-in slide-in-from-bottom-2 duration-300">
          {globalError}
        </div>
      )}
    </div>
  );
}
