import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { X, Loader2, Camera, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
  onScanSuccess: (data: { nombre: string; codigo_barra: string; imagen_url?: string; marca?: string; found: boolean }) => void;
}

export default function BarcodeScannerModal({ onClose, onScanSuccess }: Props) {
  const [scanning, setScanning] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.error("Error stopping scanner", e);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = () => {
    setScanning(true);
    setErrorMsg('');
    setTimeout(async () => {
      try {
        scannerRef.current = new Html5Qrcode("reader");
        await scannerRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.0 },
          onScan,
          onScanError
        );
      } catch (err) {
        console.error(err);
        setErrorMsg('Error al acceder a la cámara trasera. Revisa los permisos.');
        setScanning(false);
      }
    }, 100);
  };

  const onScan = async (decodedText: string) => {
    stopScanner();
    setLoadingProduct(true);
    
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${decodedText}.json`);
      const data = await res.json();
      
      if (data.status === 1 && data.product && data.product.product_name) {
        onScanSuccess({
          nombre: data.product.product_name,
          codigo_barra: decodedText,
          imagen_url: data.product.image_url,
          marca: data.product.brands?.split(',')[0],
          found: true
        });
      } else {
        // Not found in Open Food Facts or has no name, just pass the barcode
        onScanSuccess({
          nombre: '',
          codigo_barra: decodedText,
          found: false
        });
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Error al buscar el producto. Intenta manualmente.');
      setLoadingProduct(false);
    }
  };

  const onScanError = (err: any) => {
    // ignore frequent errors
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-extrabold text-lg text-[#0F3160]">Escanear Producto</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm p-2 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-6">
          {loadingProduct ? (
            <div className="py-12 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-[#0F3160] animate-spin" />
              <p className="text-slate-500 font-medium">Buscando producto en la base de datos global...</p>
            </div>
          ) : scanning ? (
            <div className="w-full">
              <div id="reader" className="w-full rounded-2xl overflow-hidden border-4 border-slate-100 bg-black"></div>
              <p className="text-center text-sm text-slate-500 mt-4">Apunta la cámara al código de barras</p>
              <button onClick={stopScanner} className="mt-6 w-full bg-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-300 transition-colors">
                Cancelar Escaneo
              </button>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center gap-4 text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <Camera className="w-12 h-12 text-[#0F3160]" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">Busca el código de barras</h4>
              <p className="text-sm text-slate-500 max-w-xs">Usa tu cámara para escanear cualquier producto del supermercado. Obtendremos su foto y nombre automáticamente.</p>
              
              {errorMsg && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mt-2">
                  <AlertCircle className="w-4 h-4" /> {errorMsg}
                </div>
              )}

              <button onClick={startScanner} className="mt-4 w-full bg-[#0F3160] text-white font-bold py-3.5 rounded-xl hover:bg-[#0a244a] shadow-md transition-all">
                Iniciar Cámara
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
