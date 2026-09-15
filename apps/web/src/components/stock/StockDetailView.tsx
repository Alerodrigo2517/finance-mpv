import { useState } from 'react';
import { Producto } from '@/types';
import { Package, ListTodo, TrendingDown, ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import CurrencyInput from '@/components/ui/CurrencyInput';

interface Props {
  producto: Producto;
  onRefresh: () => void;
  onAddPrecio: (data: { supermercado: string; precio: number; fecha: string }) => Promise<void>;
  onToggleShoppingList: (productoId: string, currentlyInList: boolean, listItemId?: string) => Promise<void>;
  onUpdateStock: (cantidad: number) => Promise<void>;
  onBack: () => void;
}

export default function StockDetailView({ producto, onRefresh, onAddPrecio, onToggleShoppingList, onUpdateStock, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<'ALACENA' | 'PRECIOS' | 'COMPRAS'>('ALACENA');
  
  const [showAddPrecio, setShowAddPrecio] = useState(false);
  const [supermercado, setSupermercado] = useState('');
  const [precio, setPrecio] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabs = [
    { id: 'ALACENA', label: 'Alacena', icon: Package },
    { id: 'PRECIOS', label: 'Precios', icon: TrendingDown },
    { id: 'COMPRAS', label: 'Compras', icon: ListTodo },
  ];

  const stockQty = producto.stock_casa?.reduce((acc, s) => acc + s.cantidad, 0) || 0;
  const inShoppingList = !!(producto.lista_compras && producto.lista_compras.length > 0);
  const [isTogglingList, setIsTogglingList] = useState(false);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  const handleSubmitPrecio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supermercado || !precio) return;
    setIsSubmitting(true);
    try {
      await onAddPrecio({ supermercado, precio: parseFloat(precio), fecha });
      setShowAddPrecio(false);
      setSupermercado(''); setPrecio('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleList = async () => {
    setIsTogglingList(true);
    try {
      await onToggleShoppingList(producto.id, inShoppingList, producto.lista_compras?.[0]?.id);
    } finally {
      setIsTogglingList(false);
    }
  };

  const handleStockUpdate = async (cantidad: number) => {
    setIsUpdatingStock(true);
    try {
      await onUpdateStock(cantidad);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      {/* Mobile Back Button */}
      <button onClick={onBack} className="md:hidden flex items-center gap-2 mb-4 text-slate-500 font-medium">
        <ArrowLeft className="w-5 h-5" /> Volver
      </button>

      {/* Header Profile */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/3 -translate-y-1/3"></div>
        
        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm ${producto.imagen_url ? 'bg-white' : 'bg-slate-50'}`}>
          {producto.imagen_url ? (
            <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-contain rounded-2xl p-2 mix-blend-multiply" />
          ) : (
            <Package className="w-10 h-10 text-slate-300" />
          )}
        </div>

        <div className="flex flex-col gap-1 flex-1">
          {producto.categoria && (
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-lg w-max uppercase tracking-wider">
              {producto.categoria}
            </span>
          )}
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F3160] leading-tight mt-1">
            {producto.nombre}
          </h2>
          {producto.codigo_barra && (
            <p className="text-slate-400 text-sm font-medium mt-1">
              Código: {producto.codigo_barra}
            </p>
          )}
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
        
        {/* ALACENA TAB */}
        {activeTab === 'ALACENA' && (
          <div className="flex flex-col items-center justify-center py-10 animate-in fade-in">
            <div className="w-32 h-32 rounded-full bg-slate-50 flex items-center justify-center mb-6 relative">
              <Package className="w-12 h-12 text-slate-300" />
              <div className={`absolute -bottom-2 -right-2 w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-xl shadow-lg border-4 border-white ${stockQty > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {stockQty}
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Unidades disponibles</h3>
            <p className="text-slate-500 text-sm mb-8 text-center max-w-xs">
              Actualmente tienes {stockQty} {stockQty === 1 ? 'unidad' : 'unidades'} de este producto en tu alacena.
            </p>
            <div className="flex gap-4 w-full max-w-xs">
              <button 
                onClick={() => handleStockUpdate(-1)}
                disabled={isUpdatingStock || stockQty <= 0}
                className="flex-1 bg-rose-50 text-rose-600 font-bold py-3 rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isUpdatingStock ? <Loader2 className="w-5 h-5 animate-spin" /> : '-1'}
              </button>
              <button 
                onClick={() => handleStockUpdate(1)}
                disabled={isUpdatingStock}
                className="flex-1 bg-emerald-50 text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {isUpdatingStock ? <Loader2 className="w-5 h-5 animate-spin" /> : '+1'}
              </button>
            </div>
          </div>
        )}

        {/* PRECIOS TAB */}
        {activeTab === 'PRECIOS' && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-xl text-slate-800">Historial de Precios</h3>
              <button onClick={() => setShowAddPrecio(true)} className="flex items-center gap-2 text-sm font-bold bg-[#0F3160] text-white px-4 py-2 rounded-xl hover:bg-[#0a244a] shadow-sm transition-all">
                <Plus className="w-4 h-4" /> Registrar
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {!producto.precios_supermercados || producto.precios_supermercados.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">No hay precios registrados para comparar.</div>
              ) : (
                producto.precios_supermercados
                  .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                  .map((p, idx, arr) => {
                    const isCheapest = p.precio === Math.min(...arr.map(x => x.precio));
                    return (
                      <div key={p.id} className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm gap-3 sm:gap-0">
                        <div className="flex flex-col gap-1 w-full sm:w-auto">
                          <span className="font-bold text-slate-800">{p.supermercado}</span>
                          <span className="text-xs text-slate-500">{new Date(p.fecha).toLocaleDateString('es-AR')}</span>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-3">
                          {isCheapest && <span className="text-[10px] bg-emerald-100 text-emerald-700 font-extrabold uppercase px-2 py-1 rounded-md tracking-wider">Mejor Opción</span>}
                          <span className="font-extrabold text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm">
                            ${p.precio.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* COMPRAS TAB */}
        {activeTab === 'COMPRAS' && (
          <div className="flex flex-col items-center justify-center py-10 animate-in fade-in px-4">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors ${inShoppingList ? 'bg-blue-100 text-[#0F3160]' : 'bg-slate-50 text-slate-300'}`}>
              <ListTodo className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Lista de Compras</h3>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed text-center mb-8">
              {inShoppingList 
                ? 'Este producto ya se encuentra en tu lista del supermercado.' 
                : 'Agrega este producto a tu lista interactiva del supermercado para no olvidarte de comprarlo.'}
            </p>
            <button 
              onClick={handleToggleList}
              disabled={isTogglingList}
              className={`font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 min-w-[200px] disabled:opacity-50 ${
                inShoppingList 
                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                  : 'bg-[#0F3160] text-white hover:bg-[#0a244a]'
              }`}
            >
              {isTogglingList && <Loader2 className="w-4 h-4 animate-spin" />}
              {!isTogglingList && (inShoppingList ? 'Quitar de la Lista' : 'Agregar a la Lista')}
            </button>
          </div>
        )}
      </div>

      {/* Add Precio Modal */}
      {showAddPrecio && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-lg text-[#0F3160]">Registrar Precio</h3>
              <button onClick={() => setShowAddPrecio(false)} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm p-2 rounded-full transition-all"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmitPrecio} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600">Supermercado</label><input type="text" placeholder="Ej. Carrefour, Coto" value={supermercado} onChange={(e) => setSupermercado(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600">Precio ($)</label><CurrencyInput placeholder="Ej. 1500" value={precio} onChange={(val) => setPrecio(val)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600">Fecha</label><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20" /></div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#0F3160] hover:bg-[#0a244a] text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-2 flex justify-center items-center gap-2">{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
