'use client';
import { useState, useEffect, useCallback } from 'react';
import { Producto } from '@/types';
import { Loader2 } from 'lucide-react';
import StockMasterView from '@/components/stock/StockMasterView';
import StockDetailView from '@/components/stock/StockDetailView';
import BarcodeScannerModal from '@/components/stock/BarcodeScannerModal';
import ScannedProductConfirmModal from '@/components/stock/ScannedProductConfirmModal';

export default function StockPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductoId, setSelectedProductoId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState<{ nombre: string; codigo_barra: string; imagen_url?: string; marca?: string; found: boolean; isExistingProduct?: boolean } | null>(null);

  const showError = (msg: string) => {
    setGlobalError(msg);
    setTimeout(() => setGlobalError(null), 3000);
  };

  const showSuccess = (msg: string) => {
    setGlobalSuccess(msg);
    setTimeout(() => setGlobalSuccess(null), 3000);
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

  const handleDeleteProductos = async (ids: string[]) => {
    try {
      const res = await fetch('/api/productos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error();
      if (selectedProductoId && ids.includes(selectedProductoId)) {
        setSelectedProductoId(null);
      }
      await fetchData();
    } catch (e) {
      showError('Error al eliminar productos');
    }
  };

  const handleManualAdd = () => {
    setScannedData({
      nombre: '',
      codigo_barra: '',
      found: false,
      isExistingProduct: false
    });
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

  const handleScanSuccess = async (barcodeData: { nombre: string; codigo_barra: string; imagen_url?: string; marca?: string; found: boolean }) => {
    setShowScanner(false);
    
    // Check if product already exists locally
    const existing = productos.find(p => p.codigo_barra === barcodeData.codigo_barra);
    if (existing) {
      setScannedData({
        ...barcodeData,
        nombre: existing.nombre,
        imagen_url: existing.imagen_url || barcodeData.imagen_url,
        marca: existing.categoria || barcodeData.marca,
        isExistingProduct: true
      });
      return;
    }

    setScannedData(barcodeData);
  };

  const handleConfirmScannedProduct = async (data: { nombre: string; categoria?: string; codigo_barra?: string; imagen_url?: string; cantidad: number; precio?: number }) => {
    try {
      let productIdToUse = '';
      
      const existing = productos.find(p => p.codigo_barra === data.codigo_barra);
      if (existing) {
        productIdToUse = existing.id;
      } else {
        const res = await fetch('/api/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: data.nombre,
            categoria: data.categoria,
            codigo_barra: data.codigo_barra || undefined, // Allow empty string to become undefined so backend can handle/generate if needed
            imagen_url: data.imagen_url,
          }),
        });
        if (!res.ok) {
           const err = await res.json();
           throw new Error(err.error || 'Error al crear producto');
        }
        const newProd = await res.json();
        productIdToUse = newProd.id;
      }

      // 2. Add Stock
      if (data.cantidad > 0) {
         await fetch('/api/stock_casa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ producto_id: productIdToUse, cantidad: data.cantidad })
         });
      }

      // 3. Add Price
      if (data.precio) {
         await fetch('/api/precios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              producto_id: productIdToUse, 
              supermercado: 'Carga Rápida', 
              precio: data.precio, 
              fecha: new Date().toISOString() 
            })
         });
      }

      await fetchData();
      setSelectedProductoId(productIdToUse);
      setScannedData(null);
    } catch (e: any) {
      showError(e.message || 'Error al guardar el producto');
      throw e;
    }
  };

  const handleToggleShoppingList = async (productoId: string, currentlyInList: boolean, listItemId?: string) => {
    try {
      if (currentlyInList && listItemId) {
        const res = await fetch(`/api/lista_compras?id=${listItemId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch('/api/lista_compras', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ producto_id: productoId }),
        });
        if (!res.ok) throw new Error();
      }
      await fetchData();
      showSuccess(currentlyInList ? 'Producto quitado de la lista' : 'Producto agregado al carrito');
    } catch (e) {
      showError('Error al actualizar la lista de compras');
    }
  };

  const handleAddManyToShoppingList = async (ids: string[]) => {
    try {
      // Verify which ones are not already in the list to avoid duplicates
      const productsToAdd = productos.filter(p => ids.includes(p.id) && (!p.lista_compras || p.lista_compras.length === 0));
      
      const responses = await Promise.all(productsToAdd.map(p => 
        fetch('/api/lista_compras', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ producto_id: p.id }),
        })
      ));
      
      const hasError = responses.some(r => !r.ok);
      if (hasError) throw new Error();

      await fetchData();
      showSuccess('Productos agregados exitosamente');
    } catch (e) {
      showError('Error al agregar a la lista de compras');
    }
  };

  const handleUpdateStock = async (productoId: string, cantidad: number) => {
    try {
      const res = await fetch('/api/stock_casa', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ producto_id: productoId, cantidad })
      });
      if (!res.ok) throw new Error();
      await fetchData();
    } catch(e) {
      showError('Error al actualizar el stock');
    }
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
    <div className="flex flex-col md:flex-row h-[calc(100dvh-150px)] md:h-[calc(100vh-100px)] gap-6 overflow-hidden animate-in fade-in duration-300">
      
      {/* Sidebar - Master View */}
      <div className={`w-full md:w-80 shrink-0 h-full flex flex-col ${selectedProductoId ? 'hidden md:flex' : 'flex'}`}>
        <StockMasterView 
          productos={productos} 
          selectedId={selectedProductoId} 
          onSelect={setSelectedProductoId}
          onScanClick={() => setShowScanner(true)}
          onManualAdd={handleManualAdd}
          onToggleShoppingList={handleToggleShoppingList}
          onAddManyToShoppingList={handleAddManyToShoppingList}
          onDelete={handleDeleteProductos}
        />
      </div>

      {/* Main Content - Detail View */}
      <div className={`flex-1 h-full min-w-0 ${!selectedProductoId ? 'hidden md:flex' : 'flex'}`}>
        {selectedProducto ? (
          <StockDetailView 
            producto={selectedProducto}
            onRefresh={fetchData}
            onAddPrecio={(data) => handleAddPrecio(selectedProducto.id, data)}
            onToggleShoppingList={handleToggleShoppingList}
            onUpdateStock={(cantidad) => handleUpdateStock(selectedProducto.id, cantidad)}
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

      {/* Scanned Product Confirm Modal */}
      {scannedData && (
        <ScannedProductConfirmModal
          initialData={scannedData}
          onConfirm={handleConfirmScannedProduct}
          onCancel={() => setScannedData(null)}
        />
      )}

      {/* Global Toast Error */}
      {globalError && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-[200] animate-in slide-in-from-bottom-2 duration-300">
          {globalError}
        </div>
      )}

      {/* Global Toast Success */}
      {globalSuccess && (
        <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-[200] animate-in slide-in-from-bottom-2 duration-300">
          {globalSuccess}
        </div>
      )}
    </div>
  );
}
