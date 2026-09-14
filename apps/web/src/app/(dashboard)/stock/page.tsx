'use client';
import { useState, useEffect, useCallback } from 'react';
import { Producto } from '@/types';
import { Loader2 } from 'lucide-react';
import StockMasterView from '@/components/stock/StockMasterView';
import StockDetailView from '@/components/stock/StockDetailView';
import BarcodeScannerModal from '@/components/stock/BarcodeScannerModal';

export default function StockPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductoId, setSelectedProductoId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const showError = (msg: string) => {
    setGlobalError(msg);
    setTimeout(() => setGlobalError(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/productos');
      if (res.ok) {
        const data = await res.json();
        setProductos(data);
      } else {
        showError('No se pudieron cargar los productos');
      }
    } catch (e) {
      console.error(e);
      showError('Error de conexión al cargar los productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddProducto = async (data: { nombre: string; categoria?: string; codigo_barra?: string; imagen_url?: string }) => {
    const res = await fetch('/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const newProd = await res.json();
      await fetchData();
      setSelectedProductoId(newProd.id);
    } else {
      throw new Error('Error al guardar el producto');
    }
  };

  const handleAddPrecio = async (productoId: string, data: { supermercado: string; precio: number; fecha: string }) => {
    const res = await fetch('/api/precios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ producto_id: productoId, ...data })
    });
    if (res.ok) {
      await fetchData();
    } else {
      throw new Error('Error al registrar el precio');
    }
  };

  const handleScanSuccess = async (barcodeData: { nombre: string; codigo_barra: string; imagen_url?: string; marca?: string }) => {
    setShowScanner(false);
    
    // Check if product already exists locally
    const existing = productos.find(p => p.codigo_barra === barcodeData.codigo_barra);
    if (existing) {
      setSelectedProductoId(existing.id);
      return;
    }

    // Add new product
    await handleAddProducto({
      nombre: barcodeData.nombre + (barcodeData.marca ? ` (${barcodeData.marca})` : ''),
      categoria: 'General',
      codigo_barra: barcodeData.codigo_barra,
      imagen_url: barcodeData.imagen_url,
    });
  };

  const selectedProducto = productos.find(p => p.id === selectedProductoId);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-[#0F3160] animate-spin" />
          <p className="text-slate-500 font-medium">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] gap-6 overflow-hidden animate-in fade-in duration-300">
      
      {/* Sidebar - Master View */}
      <div className={`w-full md:w-80 shrink-0 h-full flex flex-col ${selectedProductoId ? 'hidden md:flex' : 'flex'}`}>
        <StockMasterView 
          productos={productos}
          selectedId={selectedProductoId}
          onSelect={setSelectedProductoId}
          onAdd={handleAddProducto}
          onScanClick={() => setShowScanner(true)}
        />
      </div>

      {/* Main Content - Detail View */}
      <div className={`flex-1 h-full min-w-0 ${!selectedProductoId ? 'hidden md:flex' : 'flex'}`}>
        {selectedProducto ? (
          <StockDetailView 
            producto={selectedProducto}
            onRefresh={fetchData}
            onAddPrecio={(data) => handleAddPrecio(selectedProducto.id, data)}
            onBack={() => setSelectedProductoId(null)}
          />
        ) : (
          <div className="hidden md:flex w-full h-full items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-500">Selecciona un producto</h3>
              <p className="text-sm text-slate-400 mt-1">O escanea un código de barras para agregarlo</p>
            </div>
          </div>
        )}
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScannerModal 
          onClose={() => setShowScanner(false)} 
          onScanSuccess={handleScanSuccess} 
        />
      )}

      {/* Global Toast Error */}
      {globalError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-medium z-[200] animate-in slide-in-from-bottom-2 duration-300">
          {globalError}
        </div>
      )}
    </div>
  );
}
