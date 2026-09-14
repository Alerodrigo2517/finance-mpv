import { useState, useEffect } from 'react';
import { Producto } from '@/types';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Search, Package, ScanLine, Trash2, ListChecks, X, ShoppingCart } from 'lucide-react';

interface Props {
  productos: Producto[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onScanClick: () => void;
  onManualAdd: () => void;
  onToggleShoppingList: (id: string, inList: boolean, listId?: string) => Promise<void>;
  onAddManyToShoppingList: (ids: string[]) => Promise<void>;
  onDelete?: (ids: string[]) => Promise<void>;
}

export default function StockMasterView({ productos, selectedId, onSelect, onScanClick, onManualAdd, onToggleShoppingList, onAddManyToShoppingList, onDelete }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALACENA' | 'CATALOGO' | 'COMPRAS'>('ALACENA');

  useEffect(() => {
    if (searchTerm && activeFilter !== 'CATALOGO') {
      const searchLower = searchTerm.toLowerCase();
      
      const currentTabResults = productos.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchLower) || (p.categoria && p.categoria.toLowerCase().includes(searchLower));
        const stockQty = p.stock_casa?.reduce((acc, s) => acc + s.cantidad, 0) || 0;
        const matchesTab = (activeFilter === 'ALACENA' && stockQty > 0) || (activeFilter === 'COMPRAS' && p.lista_compras && p.lista_compras.length > 0);
        return matchesSearch && matchesTab;
      });

      if (currentTabResults.length === 0) {
        const globalResults = productos.filter(p => p.nombre.toLowerCase().includes(searchLower) || (p.categoria && p.categoria.toLowerCase().includes(searchLower)));
        if (globalResults.length > 0) {
          setActiveFilter('CATALOGO');
        }
      }
    }
  }, [searchTerm, activeFilter, productos]);

  const filtered = productos.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || (p.categoria && p.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
    const stockQty = p.stock_casa?.reduce((acc, s) => acc + s.cantidad, 0) || 0;
    
    const matchesTab = 
      (activeFilter === 'CATALOGO') || 
      (activeFilter === 'ALACENA' && stockQty > 0) ||
      (activeFilter === 'COMPRAS' && p.lista_compras && p.lista_compras.length > 0);
      
    return matchesSearch && matchesTab;
  });

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

  const handleBulkAddToShoppingList = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await onAddManyToShoppingList(selectedIds);
      setIsSelectionMode(false);
      setSelectedIds([]);
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
              onClick={onManualAdd}
              className="w-10 h-10 flex items-center justify-center bg-[#0F3160] text-white rounded-xl hover:bg-[#0a244a] transition-colors shadow-sm"
              title="Carga Manual"
            >
              <Plus className="w-5 h-5" />
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

      <div className="flex border-b border-slate-100">
        <button 
          onClick={() => setActiveFilter('ALACENA')}
          className={`flex-1 py-3 text-[11px] sm:text-sm font-bold border-b-2 transition-colors ${activeFilter === 'ALACENA' ? 'border-[#0F3160] text-[#0F3160]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          📦 Alacena
        </button>
        <button 
          onClick={() => setActiveFilter('CATALOGO')}
          className={`flex-1 py-3 text-[11px] sm:text-sm font-bold border-b-2 transition-colors ${activeFilter === 'CATALOGO' ? 'border-[#0F3160] text-[#0F3160]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          🏷️ Catálogo
        </button>
        <button 
          onClick={() => setActiveFilter('COMPRAS')}
          className={`flex-1 py-3 text-[11px] sm:text-sm font-bold border-b-2 transition-colors ${activeFilter === 'COMPRAS' ? 'border-[#0F3160] text-[#0F3160]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          🛒 Súper
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
            <Package className="w-8 h-8 mb-2 opacity-20" />
            No se encontraron productos
          </div>
        ) : (
          filtered.map(p => {
            const stockQty = p.stock_casa?.reduce((acc, s) => acc + s.cantidad, 0) || 0;
            const inShoppingList = p.lista_compras && p.lista_compras.length > 0;
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
                <div className="flex flex-col items-end shrink-0 gap-2">
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-extrabold ${stockQty > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {stockQty} ud
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Stock</span>
                  </div>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleShoppingList(p.id, !!inShoppingList, p.lista_compras?.[0]?.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${inShoppingList ? 'bg-blue-100 text-[#0F3160]' : 'bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-[#0F3160]'}`}
                    title={inShoppingList ? "Quitar de lista" : "Agregar a lista"}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {isSelectionMode && (
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between animate-in slide-in-from-bottom-2 gap-2">
          <span className="text-xs sm:text-sm font-medium text-slate-600 hidden sm:inline-block whitespace-nowrap">
            {selectedIds.length} sel.
          </span>
          <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button 
              onClick={handleBulkAddToShoppingList}
              disabled={selectedIds.length === 0 || isSubmitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0F3160] text-white font-bold rounded-xl hover:bg-[#0a244a] disabled:opacity-50 transition-colors text-[11px] sm:text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Al Súper</span>
            </button>
            <button 
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0 || isSubmitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors text-[11px] sm:text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar</span>
            </button>
          </div>
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
