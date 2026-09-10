'use client';
import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

export default function BarcodeScanner({ onScanSuccess, onScanError }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 300, height: 150 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        formatsToSupport: [Html5QrcodeSupportedFormats.ITF, Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.EAN_13]
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScanSuccess(decodedText);
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
      },
      (error) => {
        if (onScanError) {
          onScanError(error);
        }
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [isClient, onScanSuccess, onScanError]);

  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <Loader2 className="w-8 h-8 text-[#0F3160] animate-spin mb-4" />
        <span className="text-slate-500 font-medium">Iniciando cámara...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white overflow-hidden rounded-xl border border-slate-200">
      <div id="reader" className="w-full"></div>
      <style jsx global>{`
        #reader {
          border: none !important;
        }
        #reader video {
          object-fit: cover;
          border-radius: 0.75rem;
        }
        #reader__dashboard_section_csr button {
          background-color: #0F3160;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: bold;
          border: none;
          cursor: pointer;
          margin-top: 10px;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}
