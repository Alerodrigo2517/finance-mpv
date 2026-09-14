'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import { Trash2, Plus, Tag, Edit2, Save, X } from 'lucide-react';

type Categoria = {
  id: string;
  nombre: string;
  tipo: string;
};

type TipoServicio = {
  id: string;
  nombre: string;
};

export default function ConfiguracionPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tiposServicios, setTiposServicios] = useState<TipoServicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTS, setLoadingTS] = useState(true);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('EGRESO');
  const [nuevoNombreTS, setNuevoNombreTS] = useState('');
  
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [editTSId, setEditTSId] = useState<string | null>(null);
  const [deleteTSId, setDeleteTSId] = useState<string | null>(null);
  
  const [error, setError] = useState('');
  const [errorTS, setErrorTS] = useState('');

  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/categorias');
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTiposServicios = async () => {
    try {
      const res = await fetch('/api/tipos-servicios');
      if (res.ok) {
        const data = await res.json();
        setTiposServicios(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTS(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
    fetchTiposServicios();
  }, []);

  const handleAddCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nuevoNombre.trim()) return;

    try {
      const url = editId ? `/api/categorias/${editId}` : '/api/categorias';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoNombre, tipo: nuevoTipo }),
      });

      if (res.ok) {
        setNuevoNombre('');
        setEditId(null);
        fetchCategorias();
      } else {
        const data = await res.json();
        setError(data.error || 'Error al guardar la categoría');
      }
    } catch (e) {
      setError('Error de red');
    }
  };

  const handleEdit = (c: Categoria) => {
    setEditId(c.id);
    setNuevoNombre(c.nombre);
    setNuevoTipo(c.tipo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setNuevoNombre('');
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/categorias/${deleteId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar la categoría');
    fetchCategorias();
  };

  const handleAddTipoServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorTS('');
    if (!nuevoNombreTS.trim()) return;

    try {
      const url = editTSId ? `/api/tipos-servicios/${editTSId}` : '/api/tipos-servicios';
      const method = editTSId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoNombreTS }),
      });

      if (res.ok) {
        setNuevoNombreTS('');
        setEditTSId(null);
        fetchTiposServicios();
      } else {
        const data = await res.json();
        setErrorTS(data.error || 'Error al guardar');
      }
    } catch (e) {
      setErrorTS('Error de red');
    }
  };

  const handleEditTS = (ts: TipoServicio) => {
    setEditTSId(ts.id);
    setNuevoNombreTS(ts.nombre);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditTS = () => {
    setEditTSId(null);
    setNuevoNombreTS('');
  };

  const confirmDeleteTS = async () => {
    if (!deleteTSId) return;
    const res = await fetch(`/api/tipos-servicios/${deleteTSId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar');
    fetchTiposServicios();
  };

  const ingresos = categorias.filter(c => c.tipo === 'INGRESO');
  const egresos = categorias.filter(c => c.tipo === 'EGRESO');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Configuración" 
        subtitle="Personaliza tu experiencia y administra tus preferencias"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario de Alta */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddCategoria} className="glass-panel p-6 flex flex-col gap-5 sticky top-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  {editId ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {editId ? 'Modifica el nombre o tipo de esta categoría.' : 'Agrega opciones para clasificar tus movimientos.'}
                </p>
              </div>
              {editId && (
                <button type="button" onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-600" title="Cancelar edición">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {error && <div className="text-sm text-danger bg-danger/10 p-3 rounded-lg">{error}</div>}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Tipo de Movimiento</label>
              <select 
                value={nuevoTipo} 
                onChange={(e) => setNuevoTipo(e.target.value)} 
                className="input-field py-3 bg-slate-50"
              >
                <option value="EGRESO">Egreso (Gasto)</option>
                <option value="INGRESO">Ingreso</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Nombre de la Categoría</label>
              <input 
                type="text" 
                value={nuevoNombre} 
                onChange={(e) => setNuevoNombre(e.target.value)} 
                placeholder="Ej. Supermercado, Sueldo..."
                className="input-field py-3 bg-slate-50"
                required
              />
            </div>

            <button type="submit" className="btn-primary flex items-center justify-center gap-2 py-3 mt-2">
              {editId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editId ? 'Guardar Cambios' : 'Guardar Categoría'}
            </button>
          </form>
        </div>

        {/* Listado de Categorías */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-danger mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              Categorías de Egresos
            </h3>
            {loading ? (
              <p className="text-slate-500 text-sm">Cargando...</p>
            ) : egresos.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No tienes categorías de egresos. Crea una para empezar.</p>
            ) : (
              <ul className="flex flex-wrap gap-3">
                {egresos.map(c => (
                  <li key={c.id} className="bg-white border border-slate-200 shadow-sm rounded-full pl-4 pr-2 py-1.5 flex items-center gap-3 group hover:border-danger/30 transition-colors">
                    <span className="text-sm font-medium text-slate-700">{c.nombre}</span>
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleEdit(c)}
                        className="text-slate-400 hover:text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors"
                        title="Editar categoría"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteId(c.id)}
                        className="text-slate-400 hover:text-danger hover:bg-danger/10 p-1.5 rounded-full transition-colors"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              Categorías de Ingresos
            </h3>
            {loading ? (
              <p className="text-slate-500 text-sm">Cargando...</p>
            ) : ingresos.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No tienes categorías de ingresos. Crea una para empezar.</p>
            ) : (
              <ul className="flex flex-wrap gap-3">
                {ingresos.map(c => (
                  <li key={c.id} className="bg-white border border-slate-200 shadow-sm rounded-full pl-4 pr-2 py-1.5 flex items-center gap-3 group hover:border-primary/30 transition-colors">
                    <span className="text-sm font-medium text-slate-700">{c.nombre}</span>
                    <div className="flex items-center">
                      <button 
                        type="button"
                        onClick={() => handleEdit(c)}
                        className="text-slate-400 hover:text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors"
                        title="Editar categoría"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setDeleteId(c.id)}
                        className="text-slate-400 hover:text-danger hover:bg-danger/10 p-1.5 rounded-full transition-colors"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* Formulario de Alta Tipo Servicio */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddTipoServicio} className="glass-panel p-6 flex flex-col gap-5 sticky top-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  {editTSId ? 'Editar Servicio' : 'Nuevo Tipo de Servicio'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {editTSId ? 'Modifica el nombre de este servicio.' : 'Agrega opciones para tus servicios.'}
                </p>
              </div>
              {editTSId && (
                <button type="button" onClick={handleCancelEditTS} className="text-slate-400 hover:text-slate-600" title="Cancelar edición">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {errorTS && <div className="text-sm text-danger bg-danger/10 p-3 rounded-lg">{errorTS}</div>}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Nombre del Servicio</label>
              <input 
                type="text" 
                value={nuevoNombreTS} 
                onChange={(e) => setNuevoNombreTS(e.target.value)} 
                placeholder="Ej. Luz, Gas, Internet..."
                className="input-field py-3 bg-slate-50"
                required
              />
            </div>

            <button type="submit" className="btn-primary flex items-center justify-center gap-2 py-3 mt-2">
              {editTSId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editTSId ? 'Guardar Cambios' : 'Guardar Servicio'}
            </button>
          </form>
        </div>

        {/* Listado de Tipos de Servicios */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              Tipos de Servicios
            </h3>
            {loadingTS ? (
              <p className="text-slate-500 text-sm">Cargando...</p>
            ) : tiposServicios.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No tienes tipos de servicios personalizados adicionales. Crea uno para agregarlo a la lista de opciones.</p>
            ) : (
              <ul className="flex flex-wrap gap-3">
                {tiposServicios.map(ts => (
                  <li key={ts.id} className="bg-white border border-slate-200 shadow-sm rounded-full pl-4 pr-2 py-1.5 flex items-center gap-3 group hover:border-primary/30 transition-colors">
                    <span className="text-sm font-medium text-slate-700">{ts.nombre}</span>
                    <div className="flex items-center">
                      <button 
                        type="button"
                        onClick={() => handleEditTS(ts)}
                        className="text-slate-400 hover:text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors"
                        title="Editar servicio"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setDeleteTSId(ts.id)}
                        className="text-slate-400 hover:text-danger hover:bg-danger/10 p-1.5 rounded-full transition-colors"
                        title="Eliminar servicio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>

      <ConfirmDeleteDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar categoría?"
        description="¿Estás seguro de que deseas eliminar esta categoría? (Los movimientos existentes mantendrán el nombre)."
      />

      <ConfirmDeleteDialog
        isOpen={deleteTSId !== null}
        onClose={() => setDeleteTSId(null)}
        onConfirm={confirmDeleteTS}
        title="¿Eliminar tipo de servicio?"
        description="¿Estás seguro de que deseas eliminar este tipo de servicio?"
      />
    </div>
  );
}
