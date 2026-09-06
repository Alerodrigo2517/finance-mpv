'use client';
import { useState, useEffect } from 'react';

type Vehiculo = { id: string; marca: string; modelo: string; anio: number; kilometrajeActual: number; componentes?: any[] };

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [km, setKm] = useState('');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/vehiculos');
      if (res.ok) setVehiculos(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marca, modelo, anio, kilometrajeActual: km }),
      });
      if (res.ok) {
        setMarca(''); setModelo(''); setAnio(''); setKm('');
        setShowForm(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComponente = async (vehiculoId: string) => {
    const tipo = prompt('Tipo de componente (ej. Aceite, Cubiertas):');
    const vidaUtil = prompt('Vida útil en km (ej. 10000):');
    const kmCambio = prompt('Kilometraje al momento del cambio (ej. 50000):');
    const fecha = prompt('Fecha del cambio (YYYY-MM-DD):');

    if (tipo && vidaUtil && kmCambio && fecha) {
      await fetch('/api/componentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehiculoId, tipoComponente: tipo, kmVidaUtil: vidaUtil, kmUltimoCambio: kmCambio, fechaUltimoCambio: fecha })
      });
      fetchData();
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-[#0F3160]">Mis Vehículos</h1>
      <p className="text-lg text-slate-500 mb-6">Mantenimiento predictivo e historial</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="glass-panel p-8 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold text-[#0F3160]">Vehículos Registrados</span>
            <button className="btn-primary text-sm px-3 py-1" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancelar' : '+ Agregar'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <input type="text" placeholder="Marca (Ej. Ford)" value={marca} onChange={(e) => setMarca(e.target.value)} required className="input-field" />
              <input type="text" placeholder="Modelo (Ej. Fiesta)" value={modelo} onChange={(e) => setModelo(e.target.value)} required className="input-field" />
              <input type="number" placeholder="Año" value={anio} onChange={(e) => setAnio(e.target.value)} required className="input-field" />
              <input type="number" placeholder="Kilometraje Actual" value={km} onChange={(e) => setKm(e.target.value)} required className="input-field" />
              <button type="submit" className="btn-primary">Guardar Vehículo</button>
            </form>
          )}

          <div className="mt-4 flex flex-col gap-2">
            {loading ? <p className="text-slate-500">Cargando...</p> : 
             vehiculos.length === 0 ? <p className="text-slate-500">No hay vehículos.</p> :
             vehiculos.map(v => (
               <div key={v.id} className="p-3 bg-slate-50 rounded-md border border-slate-200 flex flex-col gap-2">
                 <div className="flex justify-between items-center">
                   <div>
                     <span className="font-medium block">{v.marca} {v.modelo}</span>
                     <span className="text-slate-500 text-sm">Año {v.anio} - {v.kilometrajeActual} km</span>
                   </div>
                   <button className="btn-secondary text-xs px-2 py-1" onClick={() => handleAddComponente(v.id)}>
                     + Componente
                   </button>
                 </div>
                 {v.componentes && v.componentes.length > 0 && (
                   <div className="mt-2 text-xs text-slate-500">
                     {v.componentes.map((c: any) => (
                       <span key={c.id} className="mr-2 inline-block bg-white/5 p-1 rounded">{c.tipoComponente}</span>
                     ))}
                   </div>
                 )}
               </div>
             ))
            }
          </div>
        </div>
        
        <div className="glass-panel p-8 flex flex-col gap-4">
          <span className="text-xl font-semibold text-[#0F3160]">Mantenimientos Recomendados</span>
          <div className="mt-4 flex flex-col gap-2">
            {vehiculos.flatMap(v => v.componentes?.map(c => {
               const kmParaCambio = (c.kmUltimoCambio + c.kmVidaUtil) - v.kilometrajeActual;
               if (kmParaCambio > 2000) return null; // Aún falta mucho
               
               const isDanger = kmParaCambio < 0;
               return (
                 <div key={c.id} className={`p-3 rounded-md border flex justify-between items-center ${isDanger ? 'bg-danger/10 border-danger' : 'bg-warning/10 border-warning'}`}>
                   <div>
                     <span className="font-medium block">{v.marca} {v.modelo} - {c.tipoComponente}</span>
                     <span className={`text-sm ${isDanger ? 'text-danger' : 'text-warning'}`}>
                       {isDanger ? `¡Vencido por ${Math.abs(kmParaCambio)} km!` : `Próximo en ${kmParaCambio} km`}
                     </span>
                   </div>
                 </div>
               );
            }))}
          </div>
        </div>
      </div>
    </div>
  );
}
