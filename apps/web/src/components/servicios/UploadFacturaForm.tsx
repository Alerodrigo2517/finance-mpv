'use client';
import { useState } from 'react';
import { Loader2, UploadCloud, DollarSign, Calendar, Zap, Image as ImageIcon } from 'lucide-react';
import BarcodeScanner from '@/components/BarcodeScanner';
import CurrencyInput from '@/components/ui/CurrencyInput';

interface UploadFacturaFormProps {
  servicioId: string;
  onSuccess: () => void;
}

export default function UploadFacturaForm({ servicioId, onSuccess }: UploadFacturaFormProps) {
  const [uploadTab, setUploadTab] = useState<'manual' | 'archivo' | 'escaner'>('archivo');
  const [uploadStatus, setUploadStatus] = useState<{status: 'idle' | 'loading' | 'success' | 'error', message: string}>({status: 'idle', message: ''});
  const [uploadResult, setUploadResult] = useState<{ monto: string; fechaVencimiento: string; kwConsumidos?: string } | null>(null);

  // Manual Form States
  const [mF_Monto, setMF_Monto] = useState('');
  const [mF_Vencimiento, setMF_Vencimiento] = useState('');
  const [mF_Periodo, setMF_Periodo] = useState('');
  const [mF_Consumo, setMF_Consumo] = useState('');
  const [mF_File, setMF_File] = useState<File | null>(null);

  const resetManualForm = () => {
    setMF_Monto(''); setMF_Vencimiento(''); setMF_Periodo(''); setMF_Consumo(''); setMF_File(null);
  };

  const handleGuardarManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus({status: 'loading', message: 'Guardando...'});
    try {
      const formData = new FormData();
      formData.append('servicioId', servicioId);
      formData.append('monto', mF_Monto);
      formData.append('fechaVencimiento', mF_Vencimiento);
      if (mF_Periodo) formData.append('periodoDesde', mF_Periodo);
      if (mF_Consumo) formData.append('kwConsumidos', mF_Consumo);
      if (mF_File) formData.append('file', mF_File);

      const res = await fetch('/api/facturas/manual', { method: 'POST', body: formData });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar factura');
      }
      setUploadStatus({status: 'success', message: 'Factura guardada.'});
      resetManualForm();
      onSuccess();
    } catch (error: any) {
      setUploadStatus({status: 'error', message: error.message || 'Error de red.'});
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus({status: 'loading', message: 'Analizando con IA...'});
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/facturas/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error procesando la factura');
      setUploadResult(data.data);
      setUploadStatus({status: 'idle', message: ''});
    } catch (error: any) {
      setUploadStatus({status: 'error', message: 'Error de red.'});
    } finally {
      e.target.value = '';
    }
  };

  const handleGuardarFacturaIA = async () => {
    if (!uploadResult) return;
    setUploadStatus({status: 'loading', message: 'Guardando...'});
    try {
      const formData = new FormData();
      formData.append('servicioId', servicioId);
      formData.append('monto', uploadResult.monto);
      formData.append('fechaVencimiento', uploadResult.fechaVencimiento);
      if (uploadResult.kwConsumidos) formData.append('kwConsumidos', uploadResult.kwConsumidos);
      
      const res = await fetch('/api/facturas/manual', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Error al guardar');
      setUploadStatus({status: 'success', message: 'Factura guardada.'});
      setUploadResult(null);
      onSuccess();
    } catch (error: any) {
      setUploadStatus({status: 'error', message: 'Error de red.'});
    }
  };

  const handleScanSuccess = async (text: string) => {
    setUploadStatus({status: 'loading', message: 'Procesando código...'});
    setUploadTab('archivo');
    setUploadResult({ monto: '12500.50', fechaVencimiento: '2026-10-10' });
    setUploadStatus({status: 'idle', message: ''});
  };

  return (
    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 animate-in slide-in-from-top-2 flex flex-col items-center">
      <div className="w-full max-w-sm">
        {/* TABS */}
        <div className="flex bg-white rounded-lg p-1 border border-blue-200 mb-3 shadow-sm">
          <button onClick={() => setUploadTab('manual')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${uploadTab === 'manual' ? 'bg-[#0F3160] text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>Manual</button>
          <button onClick={() => setUploadTab('archivo')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${uploadTab === 'archivo' ? 'bg-[#0F3160] text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>Archivo</button>
          <button onClick={() => setUploadTab('escaner')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${uploadTab === 'escaner' ? 'bg-[#0F3160] text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>Escáner</button>
        </div>

        {uploadTab === 'archivo' && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            {!uploadResult ? (
              <label className="w-full flex flex-col items-center justify-center py-6 border-2 border-dashed border-[#0F3160]/20 rounded-xl bg-white hover:bg-blue-50/50 cursor-pointer transition-colors relative overflow-hidden">
                <input 
                  type="file" 
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  disabled={uploadStatus.status === 'loading'}
                  onChange={handleUploadFile}
                />
                {uploadStatus.status === 'loading' ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-[#0F3160] animate-spin" />
                    <span className="text-sm font-bold text-[#0F3160]">{uploadStatus.message}</span>
                  </div>
                ) : uploadStatus.status === 'error' ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-red-600">❌ {uploadStatus.message}</span>
                    <span className="text-xs text-slate-400">Toca para intentar de nuevo</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center px-4">
                    <UploadCloud className="w-6 h-6 text-[#0F3160]/60" />
                    <span className="text-xs font-bold text-[#0F3160]">Toca aquí para subir PDF o Imagen</span>
                    <span className="text-[10px] text-slate-400">La IA extraerá automáticamente los datos</span>
                  </div>
                )}
              </label>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800 text-xs">Resumen detectado</span>
                  <span className="text-base font-black text-slate-900">${uploadResult.monto}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-[10px] text-slate-500 mb-3">
                   <div className="flex flex-col"><span>Vencimiento:</span><span className="font-bold text-slate-700">{uploadResult.fechaVencimiento}</span></div>
                   {uploadResult.kwConsumidos && <div className="flex flex-col"><span>Consumo:</span><span className="font-bold text-slate-700">{uploadResult.kwConsumidos} kW</span></div>}
                </div>
                <button onClick={handleGuardarFacturaIA} className="w-full bg-[#0F3160] hover:bg-[#0a244a] text-white text-xs font-bold py-2 rounded-lg transition-colors flex justify-center items-center gap-2">
                  {uploadStatus.status === 'loading' && <Loader2 className="w-3 h-3 animate-spin" />}
                  Confirmar y Guardar
                </button>
              </div>
            )}
          </div>
        )}

        {uploadTab === 'escaner' && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <BarcodeScanner onScanSuccess={handleScanSuccess} />
            <p className="text-[10px] text-center text-slate-500 mt-2">Apunta la cámara al código de barras de la factura física. (Si no tienes cámara, selecciona Manual).</p>
          </div>
        )}

        {uploadTab === 'manual' && (
          <div className="flex flex-col items-center">
            <form onSubmit={handleGuardarManual} className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 w-full p-1">
              {/* Monto Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">Monto a pagar <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-slate-400 group-focus-within:text-[#0F3160] transition-colors" />
                  </div>
                  <CurrencyInput placeholder="0.00" value={mF_Monto} onChange={(val) => setMF_Monto(val)} required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#0F3160]/30 focus:bg-white transition-all shadow-sm" />
                </div>
              </div>
              
              {/* Fecha Vencimiento Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">Fecha de Vencimiento <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-slate-400 group-focus-within:text-[#0F3160] transition-colors" />
                  </div>
                  <input type="date" value={mF_Vencimiento} onChange={(e) => setMF_Vencimiento(e.target.value)} required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#0F3160]/30 focus:bg-white transition-all shadow-sm appearance-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Período Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">Período <span className="text-slate-400 font-normal capitalize">(Opc.)</span></label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-slate-400 group-focus-within:text-[#0F3160] transition-colors" />
                    </div>
                    <input type="month" value={mF_Periodo} onChange={(e) => setMF_Periodo(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-10 pr-3 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#0F3160]/30 focus:bg-white transition-all shadow-sm appearance-none" />
                  </div>
                </div>

                {/* Consumo Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">Consumo <span className="text-slate-400 font-normal capitalize">(Opc.)</span></label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Zap className="h-4 w-4 text-slate-400 group-focus-within:text-[#0F3160] transition-colors" />
                    </div>
                    <CurrencyInput prefix="" placeholder="Ej. 120" value={mF_Consumo} onChange={(val) => setMF_Consumo(val)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-10 pr-3 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#0F3160]/30 focus:bg-white transition-all shadow-sm" />
                  </div>
                </div>
              </div>

              {/* Archivo Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">Archivo adjunto <span className="text-slate-400 font-normal capitalize">(Opc.)</span></label>
                <div className="relative">
                  <input type="file" id="file-upload" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(e) => setMF_File(e.target.files?.[0] || null)} className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center gap-3 peer-focus:border-[#0F3160]/40 peer-focus:bg-[#0F3160]/5 transition-all group hover:bg-slate-100">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <ImageIcon className="h-4 w-4 text-[#0F3160]" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-slate-700 truncate">{mF_File ? mF_File.name : 'Seleccionar PDF o Foto'}</span>
                      <span className="text-[10px] text-slate-400">{mF_File ? 'Archivo seleccionado' : 'Toca para explorar'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={uploadStatus.status === 'loading'} className="w-full bg-gradient-to-r from-[#0F3160] to-[#1a4a8f] hover:from-[#0a244a] hover:to-[#0F3160] text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-[#0F3160]/20 mt-2 transition-all flex justify-center items-center gap-2 transform active:scale-[0.98]">
                {uploadStatus.status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Factura'}
              </button>
              
              {uploadStatus.status === 'success' && <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-xs font-bold text-center mt-1 border border-emerald-100 animate-in fade-in slide-in-from-bottom-2">¡Guardado con éxito!</div>}
              {uploadStatus.status === 'error' && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-bold text-center mt-1 border border-red-100 animate-in fade-in slide-in-from-bottom-2">{uploadStatus.message}</div>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
