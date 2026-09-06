'use client';
import { useState, useEffect } from 'react';
import BlankState from '@/components/ui/BlankState';
import PageHeader from '@/components/ui/PageHeader';
import { ShoppingBag, Search } from 'lucide-react';

type Producto = { id: string; nombre: string; categoria: string; codigoBarra: string | null; stocks?: any[] };

export default function StockPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [cantidad, setCantidad] = useState('1');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/productos');
      if (res.ok) setProductos(await res.json());
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
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, categoria, codigoBarras, cantidad }),
      });
      if (res.ok) {
        setNombre(''); setCategoria(''); setCodigoBarras(''); setCantidad('1');
        setShowForm(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <PageHeader 
        title="Control de Stock y Compras" 
        subtitle="Alimentos y artículos del hogar"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="glass-panel p-8 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold text-[#0F3160]">Productos Registrados</span>
            <div className="flex gap-2">
              <button className="btn-secondary text-sm px-3 py-1" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancelar' : '+ Manual'}
              </button>
            </div>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <input type="text" placeholder="Nombre (Ej. Leche)" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="input-field" />
              <input type="text" placeholder="Categoría (Ej. Lácteos)" value={categoria} onChange={(e) => setCategoria(e.target.value)} required className="input-field" />
              <input type="text" placeholder="Código de Barras (Opcional)" value={codigoBarras} onChange={(e) => setCodigoBarras(e.target.value)} className="input-field" />
              <input type="number" placeholder="Cantidad" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required min="1" className="input-field" />
              <button type="submit" className="btn-primary">Guardar Producto</button>
            </form>
          )}

          <div className="mt-4 flex flex-col gap-2">
            {loading ? <p className="text-slate-500 text-center py-8">Cargando...</p> :
              productos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-xl mt-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-[#0F3160] font-bold mb-1">Sin productos registrados</h4>
                  <p className="text-slate-500 text-sm max-w-[220px]">Agrega productos a tu inventario para comenzar a gestionar el stock.</p>
                  <button onClick={() => setShowForm(true)} className="mt-4 text-primary font-medium text-sm hover:underline">
                    + Cargar manualmente
                  </button>
                </div>
              ) :
                productos.map(p => {
               const qty = p.stocks?.reduce((acc: number, s: any) => acc + s.cantidad, 0) || 0;
               return (
                 <div key={p.id} className="p-3 bg-slate-50 rounded-md border border-slate-200 flex justify-between items-center">
                   <div>
                     <span className="font-medium block">{p.nombre}</span>
                     <span className="text-slate-500 text-sm">{p.categoria}</span>
                   </div>
                   <div className="text-right">
                     <span className="font-semibold text-primary">{qty} uds</span>
                     {p.codigoBarra && <span className="block text-slate-500 text-xs">#{p.codigoBarra}</span>}
                   </div>
                 </div>
               );
             })
            }
          </div>
        </div>

        <div className="glass-panel p-8 flex flex-col items-center justify-center min-h-[400px]">
          <BlankState 
            variant="empty-cart"
            Icon={ShoppingBag}
            title="Tu lista de compras está vacía"
            description="Se generará sola cuando el stock de algún producto llegue a cero o esté cerca de agotarse."
            action={
              <button onClick={() => setShowForm(true)} className="bg-secondary hover:bg-secondaryHover text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-sm">
                + Agregar al Inventario
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}
