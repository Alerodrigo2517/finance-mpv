import { useState, useEffect } from 'react';
import { X, Check, Search, Tag, Loader2, Image as ImageIcon, PackagePlus, DollarSign } from 'lucide-react';

interface Props {
  initialData: { nombre: string; codigo_barra: string; imagen_url?: string; marca?: string; found: boolean; isExistingProduct?: boolean };
  onConfirm: (data: { nombre: string; categoria?: string; codigo_barra?: string; imagen_url?: string; cantidad: number; precio?: number }) => Promise<void>;
  onCancel: () => void;
}

export default function ScannedProductConfirmModal({ initialData, onConfirm, onCancel }: Props) {
  const [nombre, setNombre] = useState(initialData.nombre || '');
  const [categoria, setCategoria] = useState(initialData.marca || 'General'); // Use brand as category initially if available
  const [cantidad, setCantidad] = useState<number>(1);
  const [precio, setPrecio] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-focus name input on mount if empty
  useEffect(() => {
    if (!initialData.found) {
      document.getElementById('product-name-input')?.focus();
    }
  }, [initialData.found]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('El nombre es obligatorio');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onConfirm({
        nombre: nombre.trim(),
        categoria: categoria.trim() || 'General',
        codigo_barra: initialData.codigo_barra,
        imagen_url: initialData.imagen_url,
        cantidad: cantidad,
        precio: precio ? parseFloat(precio) : undefined
      });
    } catch (e: any) {
      setErrorMsg(e.message || 'Error al guardar el producto');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-extrabold text-lg text-[#0F3160]">
            {initialData.isExistingProduct ? 'Carga Rápida de Stock' : initialData.found ? 'Confirmar Producto' : 'Producto Nuevo'}
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm p-2 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {!initialData.found && !initialData.isExistingProduct && (
            <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl flex items-start gap-3 border border-amber-200/50">
              <Search className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">
                No encontramos este código de barras en la base de datos global. Por favor, ingresa los datos manualmente.
              </div>
            </div>
          )}

          {initialData.imagen_url && (
            <div className="w-24 h-24 rounded-2xl border-2 border-slate-100 mx-auto bg-white flex items-center justify-center p-2 shadow-sm">
              <img src={initialData.imagen_url} alt="Producto" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
          )}

          {initialData.isExistingProduct ? (
            <div className="text-center">
              <h4 className="text-lg font-bold text-slate-800">{initialData.nombre}</h4>
              {initialData.marca && <p className="text-sm text-slate-500">{initialData.marca}</p>}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="product-name-input" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nombre del Producto</label>
                <input 
                  id="product-name-input"
                  type="text" 
                  placeholder="Ej: Leche Descremada La Serenísima" 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)} 
                  className={`w-full bg-slate-50 border ${errorMsg ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 transition-all`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Categoría / Marca</label>
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Ej: Lácteos, Bebidas..." 
                    value={categoria} 
                    onChange={(e) => setCategoria(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3160]/20 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Stock a sumar</label>
              <div className="relative">
                <PackagePlus className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="number" 
                  min="1"
                  value={cantidad} 
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 1)} 
                  className="w-full bg-blue-50 border border-blue-200 rounded-xl pl-10 pr-4 py-3 text-sm text-[#0F3160] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Precio (Opcional)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  placeholder="Ej: 1500"
                  value={precio} 
                  onChange={(e) => setPrecio(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                />
              </div>
            </div>
          </div>
          
          {!initialData.isExistingProduct && initialData.codigo_barra && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Código Escaneado</label>
              <div className="w-full bg-slate-100/50 border border-slate-200/50 rounded-xl px-4 py-3 text-sm text-slate-500 font-mono select-all">
                {initialData.codigo_barra}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="text-red-500 text-sm font-medium text-center">
              {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-[#0F3160] hover:bg-[#0a244a] text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-2 flex justify-center items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </form>
      </div>
    </div>
  );
}
