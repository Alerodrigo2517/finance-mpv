import { useState } from 'react';
import { Producto } from '@/types';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Search, Package, ScanLine, Trash2, ListChecks, X } from 'lucide-react';

interface Props {
  productos: Producto[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (data: { nombre: string; categoria?: string; codigo_barra?: string }) => Promise<void>;
  onScanClick: () => void;
  onDelete?: (ids: string[]) => Promise<void>;
}

export default function StockMasterView({ productos, selectedId, onSelect, onAdd, onScanClick, onDelete }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [codigo, setCodigo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const filtered = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.categoria && p.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return;
    setIsSubmitting(true);
    try {
      await onAdd({ nombre, categoria, codigo_barra: codigo });
      setNombre(''); setCategoria(''); setCodigo('');
      setShowAddForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDeleteSelected = () => {
    if (!onDelete || selectedIds.length === 0) return;
    setShowConfirmDelete(true);
  };

  const confirmDeletion = async () => {
    if (!onDelete || selectedIds.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await onDelete(selectedIds);
      setIsSelectionMode(false);
      setSelectedIds([]);
      setShowConfirmDelete(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-[#0F3160]">Productos</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                if (isSelectionMode) setSelectedIds([]);
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                isSelectionMode ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
              title="Selección Múltiple"
            >
              {isSelectionMode ? <X className="w-5 h-5" /> : <ListChecks className="w-5 h-5" />}
            </button>
            <button 
              onClick={onScanClick}
              className="w-10 h-10 flex items-center justify-center bg-blue-50 text-primary rounded-xl hover:bg-blue-100 transition-colors"
              title="Escanear Código"
            >
              <ScanLine className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-10 h-10 flex items-center justify-center bg-[#0F3160] text-white rounded-xl hover:bg-[#0a244a] transition-colors shadow-sm"
            >
              <Plus className={`w-5 h-5 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar producto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-3 animate-in slide-in-from-top-2">
            <h3 className="font-bold text-sm text-slate-700">Nuevo Producto (Manual)</h3>
            <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" />
            <input type="text" placeholder="Categoría (Ej. Bebidas)" value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" />
            <input type="text" placeholder="Código (Opcional)" value={codigo} onChange={e => setCodigo(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" />
            <button type="submit" disabled={isSubmitting} className="w-full bg-[#0F3160] text-white font-bold py-2 rounded-xl text-sm mt-1">{isSubmitting ? 'Guardando...' : 'Guardar'}</button>
          </form>
        )}

        {filtered.length === 0 && !showAddForm ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
            <Package className="w-8 h-8 mb-2 opacity-20" />
            No se encontraron productos
          </div>
        ) : (
          filtered.map(p => {
            const stockQty = p.stock_casa?.reduce((acc, s) => acc + s.cantidad, 0) || 0;
            return (
              <button
                key={p.id}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleSelection(p.id);
                  } else {
                    onSelect(p.id);
                  }
                }}
                className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                  isSelectionMode && selectedIds.includes(p.id)
                    ? 'border-red-400 bg-red-50/50 shadow-sm'
                    : selectedId === p.id 
                      ? 'border-primary bg-blue-50/50 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isSelectionMode && (
                  <div className="flex items-center justify-center shrink-0">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedIds.includes(p.id) ? 'bg-red-500 border-red-500' : 'border-slate-300 bg-white'}`}>
                      {selectedIds.includes(p.id) && <X className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${p.imagen_url ? 'bg-white' : 'bg-slate-100'}`}>
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-contain rounded-xl mix-blend-multiply" />
                  ) : (
                    <Package className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-slate-800 truncate">{p.nombre}</span>
                  {p.categoria && <span className="text-xs text-slate-500 truncate">{p.categoria}</span>}
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className={`text-sm font-extrabold ${stockQty > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {stockQty} ud
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Stock</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {isSelectionMode && (
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between animate-in slide-in-from-bottom-2">
          <span className="text-sm font-medium text-slate-600">
            {selectedIds.length} seleccionado(s)
          </span>
          <button 
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0 || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      )}

      <ConfirmModal 
        isOpen={showConfirmDelete}
        title="Eliminar Productos"
        message={`¿Estás seguro de que deseas eliminar ${selectedIds.length} producto(s)? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDestructive={true}
        isLoading={isSubmitting}
        onConfirm={confirmDeletion}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </div>
  );
}
