'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import BlankState from '@/components/ui/BlankState';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import { FileText, Edit2, Trash2 } from 'lucide-react';

import { Movimiento } from '@/types';

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [tipo, setTipo] = useState('EGRESO');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categoriasOpt, setCategoriasOpt] = useState<{id: string, nombre: string, tipo: string}[]>([]);
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchMovimientos = async () => {
    try {
      const res = await fetch('/api/movimientos');
      if (res.ok) {
        const data = await res.json();
        setMovimientos(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/categorias');
      if (res.ok) {
        const data = await res.json();
        setCategoriasOpt(data);
        // Set default category if none selected
        if (!categoria && data.length > 0) {
          const defaults = data.filter((c: { tipo: string; nombre: string }) => c.tipo === tipo);
          if (defaults.length > 0) setCategoria(defaults[0].nombre);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMovimientos();
    fetchCategorias();
  }, []);

  // Update default category when 'tipo' changes
  useEffect(() => {
    const defaults = categoriasOpt.filter(c => c.tipo === tipo);
    if (defaults.length > 0) {
      // Solo cambiar si la actual no coincide con el tipo
      const currentExists = defaults.find(c => c.nombre === categoria);
      if (!currentExists) setCategoria(defaults[0].nombre);
    } else {
      setCategoria('');
    }
  }, [tipo, categoriasOpt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId ? `/api/movimientos/${editId}` : '/api/movimientos';
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, monto, categoria, descripcion, fecha }),
      });
      
      if (res.ok) {
        setMonto('');
        setCategoria('');
        setDescripcion('');
        setFecha(new Date().toISOString().split('T')[0]);
        setEditId(null);
        fetchMovimientos();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (m: Movimiento) => {
    setEditId(m.id);
    setTipo(m.tipo);
    setMonto(m.monto.toString());
    setCategoria(m.categoria);
    setDescripcion(m.descripcion || '');
    setFecha(m.fecha.split('T')[0]);
    // Hacer scroll arriba para ver el form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/movimientos/${deleteId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar el movimiento');
    fetchMovimientos();
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Movimientos" 
        subtitle="Gestiona tus ingresos y egresos"
      />

      {/* Formulario de Carga */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 flex flex-col gap-4 mb-8 relative">
        {editId && (
          <button 
            type="button" 
            onClick={() => { 
              setEditId(null); 
              setMonto(''); 
              setCategoria(''); 
              setDescripcion(''); 
              setFecha(new Date().toISOString().split('T')[0]);
            }}
            className="absolute top-6 right-6 text-sm text-slate-400 hover:text-slate-600 font-medium"
          >
            Cancelar Edición
          </button>
        )}
        <h3 className="text-xl font-semibold mb-4 text-[#0F3160]">{editId ? 'Editar Movimiento' : 'Cargar Nuevo'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-500">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} required className="input-field">
              <option value="EGRESO">Egreso (Gasto)</option>
              <option value="INGRESO">Ingreso</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-500">Fecha</label>
            <input 
              type="date" 
              value={fecha} 
              onChange={(e) => setFecha(e.target.value)} 
              required 
              className="input-field"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-500">Monto</label>
            <input 
              type="number" 
              step="0.01" 
              value={monto} 
              onChange={(e) => setMonto(e.target.value)} 
              required 
              placeholder="0.00"
              className="input-field"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-sm text-slate-500">Categoría</label>
              <a href="/configuracion" className="text-xs text-primary hover:underline">Configurar</a>
            </div>
            {categoriasOpt.filter(c => c.tipo === tipo).length === 0 ? (
              <select disabled className="input-field bg-slate-100 text-slate-400">
                <option>Sin categorías - Ve a Configurar</option>
              </select>
            ) : (
              <select 
                value={categoria} 
                onChange={(e) => setCategoria(e.target.value)} 
                required 
                className="input-field"
              >
                <option value="" disabled>Selecciona una...</option>
                {categoriasOpt
                  .filter(c => c.tipo === tipo)
                  .map(c => (
                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                  ))
                }
              </select>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-500">Descripción (Opcional)</label>
            <input 
              type="text" 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
              placeholder="Ej. Compra semanal"
              className="input-field"
            />
          </div>
        </div>
        <button type="submit" className="btn-primary self-start mt-2">
          {editId ? 'Guardar Cambios' : 'Guardar'}
        </button>
      </form>

      {/* Tabla de Movimientos */}
      <div className="glass-panel w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="p-4 border-b border-slate-200 text-slate-500 font-medium">Fecha</th>
              <th className="p-4 border-b border-slate-200 text-slate-500 font-medium">Tipo</th>
              <th className="p-4 border-b border-slate-200 text-slate-500 font-medium">Categoría</th>
              <th className="p-4 border-b border-slate-200 text-slate-500 font-medium">Descripción</th>
              <th className="p-4 border-b border-slate-200 text-slate-500 font-medium">Monto</th>
              <th className="p-4 border-b border-slate-200 text-slate-500 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center p-4">Cargando...</td></tr>
            ) : movimientos.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-0">
                  <BlankState 
                    variant="not-found"
                    Icon={FileText}
                    title="Sin movimientos" 
                    description="Todavía no cargaste ningún gasto. Probá mandando un audio por WhatsApp." 
                  />
                </td>
              </tr>
            ) : (
              movimientos.map((m) => (
                <tr key={m.id}>
                  <td className="p-4 border-b border-slate-200 text-[#0F3160] font-medium">{new Date(m.fecha).toLocaleDateString()}</td>
                  <td className={`p-4 border-b border-slate-200 font-semibold ${m.tipo === 'INGRESO' ? 'text-primary' : 'text-danger'}`}>
                    {m.tipo}
                  </td>
                  <td className="p-4 border-b border-slate-200 text-[#0F3160] font-medium">{m.categoria}</td>
                  <td className="p-4 border-b border-slate-200 text-slate-600">{m.descripcion || '-'}</td>
                  <td className={`p-4 border-b border-slate-200 font-semibold ${m.tipo === 'INGRESO' ? 'text-primary' : 'text-danger'}`}>
                    {Number(m.monto).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                  </td>
                  <td className="p-4 border-b border-slate-200 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(m)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(m.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar movimiento?"
        description="¿Estás seguro de que deseas eliminar este movimiento? Esta acción no se puede deshacer."
      />
    </div>
  );
}
