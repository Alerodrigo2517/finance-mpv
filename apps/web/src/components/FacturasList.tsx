'use client';
import { useState, useRef } from 'react';
import { ExternalLink, Download, Check, Edit2, Trash2, Loader2, X, UploadCloud, Image as ImageIcon } from 'lucide-react';

import { Factura } from '@/types';

interface FacturasListProps {
  facturas: Factura[];
  nombreProveedor: string;
  onDeleteFactura: (id: string) => void;
  onPayFactura?: (id: string) => Promise<void>;
  onEditFactura?: (factura: Factura) => void;
}

export default function FacturasList({ facturas, nombreProveedor, onDeleteFactura, onPayFactura, onEditFactura }: FacturasListProps) {
  const [payingId, setPayingId] = useState<string | null>(null);
  const [missingFileId, setMissingFileId] = useState<string | null>(null);

  // States for Dialog
  const [confirmPayId, setConfirmPayId] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [metodoPago, setMetodoPago] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for Detail Modal
  const [detailFactura, setDetailFactura] = useState<Factura | null>(null);

  const handlePayClick = (id: string) => {
    setConfirmPayId(id);
    setFileToUpload(null);
    setMetodoPago('');
  };

  const handleConfirmPayWithoutReceipt = async () => {
    if (!onPayFactura || !confirmPayId) return;
    if (!metodoPago) { alert('Por favor, selecciona un método de pago.'); return; }
    const id = confirmPayId;
    setConfirmPayId(null);
    setPayingId(id);
    try {
      await onPayFactura(id, metodoPago);
    } finally {
      setPayingId(null);
    }
  };

  const handleConfirmPayWithReceipt = async () => {
    if (!onPayFactura || !confirmPayId || !fileToUpload) return;
    if (!metodoPago) { alert('Por favor, selecciona un método de pago.'); return; }
    const id = confirmPayId;
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('metodoPago', metodoPago);
      
      const res = await fetch(`/api/facturas/${id}/comprobante`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error('Error al subir el comprobante');
      }
      
      // Call onPayFactura to refresh the data in parent component
      await onPayFactura(id);
    } catch (error) {
      console.error(error);
      alert('Hubo un error al subir el comprobante.');
    } finally {
      setIsUploading(false);
      setConfirmPayId(null);
      setFileToUpload(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-2 pb-2">
        {facturas.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No hay facturas cargadas.</div>
        ) : (
          facturas.map((f) => {
            const pDesde = f.periodoDesde || (f as any).periodo_desde;
            const fVenc = f.fechaVencimiento || (f as any).fecha_vencimiento;
            const fechaBase = pDesde ? new Date(pDesde) : new Date(fVenc || (f as any).created_at || new Date().toISOString());
            let mesCapitalizado = '';
            if (!isNaN(fechaBase.getTime())) {
              const mesNombre = fechaBase.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
              mesCapitalizado = mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1);
            }
            const esPendiente = f.estado === 'PENDIENTE';

            return (
              <div key={f.id} className="bg-white border-2 border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors shadow-sm relative group flex flex-col gap-3">
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    {mesCapitalizado && <span className="font-black text-[#0F3160] text-xl capitalize tracking-tight">{mesCapitalizado}</span>}
                    <span className="font-medium text-slate-400 text-sm tracking-wide">{nombreProveedor}</span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-black text-slate-800 text-xl">
                      ${Number(f.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="flex gap-2 items-center">
                      {esPendiente ? (
                        <div className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold uppercase">Pendiente</div>
                      ) : (
                        <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1"><Check className="w-3 h-3"/> Pagado</div>
                      )}
                      
                      {esPendiente && onPayFactura && (
                        <button 
                          onClick={() => handlePayClick(f.id)} 
                          disabled={payingId === f.id}
                          className="px-2.5 py-1 bg-[#0F3160] text-white border border-[#0F3160] rounded-lg text-[10px] font-bold uppercase hover:bg-[#0a244a] transition-colors flex items-center gap-1 disabled:opacity-70"
                        >
                          {payingId === f.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3"/>}
                          {payingId === f.id ? 'Cargando...' : 'Pagar'}
                        </button>
                      )}
                      
                      {onEditFactura && (
                        <button onClick={() => onEditFactura(f)} className="p-1 bg-white text-slate-400 hover:text-blue-500 rounded-lg transition-colors" title="Editar Factura">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      <button onClick={() => onDeleteFactura(f.id)} className="p-1 bg-white text-slate-400 hover:text-red-500 rounded-lg transition-colors" title="Eliminar Factura">
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Actions overlay when hover */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4 justify-start flex-wrap">
                  {(() => {
                    const url = f.archivoUrl || (f as any).archivo_url;
                    const comprobanteUrl = f.comprobanteUrl || (f as any).comprobante_url;
                    
                    return (
                      <>
                        {/* Factura Actions */}
                        {url ? (
                          <>
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs font-bold text-[#0F3160] hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
                            >
                              <ExternalLink className="w-4 h-4" /> Ver factura
                            </a>
                          </>
                        ) : (
                          <button 
                            onClick={() => { setMissingFileId(f.id); setTimeout(() => setMissingFileId(null), 3000); }}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-700 transition-colors bg-slate-50 hover:bg-amber-50 px-3 py-1.5 rounded-lg"
                          >
                            <ExternalLink className="w-4 h-4" /> Ver factura
                          </button>
                        )}

                        {/* Comprobante Actions */}
                        {f.estado === 'PAGADA' && (
                          comprobanteUrl ? (
                            <a 
                              href={comprobanteUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg"
                            >
                              <ExternalLink className="w-4 h-4" /> Ver comprobante
                            </a>
                          ) : (
                            <button 
                              onClick={() => { setMissingFileId(f.id); setTimeout(() => setMissingFileId(null), 3000); }}
                              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-700 transition-colors bg-slate-50 hover:bg-amber-50 px-3 py-1.5 rounded-lg"
                            >
                              <ExternalLink className="w-4 h-4" /> Ver comprobante
                            </button>
                          )
                        )}

                        {/* Detalles */}
                        {f.estado === 'PAGADA' && (
                          <button
                            onClick={() => setDetailFactura(f)}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg ml-auto"
                          >
                            Ver detalles
                          </button>
                        )}

                        {missingFileId === f.id && !url && (
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in zoom-in duration-200 border border-amber-200 shadow-sm ml-auto">
                            No hay archivo
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Dialog for Comprobante */}
      {confirmPayId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full relative flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setConfirmPayId(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mt-2">
              <h4 className="font-bold text-[#0F3160] text-xl">Confirmar Pago</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Vas a marcar esta factura como pagada. Por favor, selecciona el método de pago y si lo deseas, adjunta un comprobante.
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              {/* Select Método de Pago */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Método de pago <span className="text-red-500">*</span></label>
                <select 
                  value={metodoPago} 
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-[#0F3160] transition-colors"
                >
                  <option value="" disabled>Selecciona una opción</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Mercado Pago">Mercado Pago</option>
                  <option value="Cuenta DNI">Cuenta DNI</option>
                  <option value="Banco Nación">Banco Nación</option>
                  <option value="Banco (Otro)">Banco (Otro)</option>
                </select>
              </div>
              {/* File Input */}
              <div className="relative">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="application/pdf,image/jpeg,image/png,image/webp" 
                  onChange={(e) => setFileToUpload(e.target.files?.[0] || null)} 
                  className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                  disabled={isUploading}
                />
                <div className={`w-full bg-slate-50 border-2 border-dashed ${fileToUpload ? 'border-[#0F3160] bg-[#0F3160]/5' : 'border-slate-200'} rounded-xl p-4 flex flex-col items-center gap-2 peer-focus:border-[#0F3160]/40 transition-all group hover:bg-slate-100`}>
                  {fileToUpload ? (
                    <>
                      <ImageIcon className="w-8 h-8 text-[#0F3160]" />
                      <span className="text-xs font-bold text-[#0F3160] text-center px-2 truncate max-w-[250px]">{fileToUpload.name}</span>
                      <span className="text-[10px] text-slate-500">Toca para cambiar</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-[#0F3160] transition-colors" />
                      <span className="text-xs font-bold text-slate-600">Toca para elegir archivo</span>
                      <span className="text-[10px] text-slate-400">Opcional (PDF, JPG, PNG)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-2">
                <button 
                  onClick={fileToUpload ? handleConfirmPayWithReceipt : () => fileInputRef.current?.click()} 
                  disabled={isUploading}
                  className={`w-full text-white text-sm font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 shadow-sm ${fileToUpload ? 'bg-[#0F3160] hover:bg-[#0a244a]' : 'bg-slate-800 hover:bg-slate-900'}`}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {fileToUpload ? 'Subir y Confirmar' : 'Elegir comprobante'}
                </button>
                <button 
                  onClick={handleConfirmPayWithoutReceipt}
                  disabled={isUploading}
                  className="w-full text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm font-bold py-3 rounded-xl transition-all"
                >
                  Solo marcar como pagado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Details */}
      {detailFactura && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full relative flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setDetailFactura(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="mt-2">
              <h4 className="font-bold text-[#0F3160] text-xl mb-4">Detalles de Pago</h4>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fecha y Hora</span>
                  <span className="text-sm font-medium text-slate-700">
                    {detailFactura.fechaPago || detailFactura.fecha_pago 
                      ? new Date(detailFactura.fechaPago || detailFactura.fecha_pago!).toLocaleString('es-AR')
                      : 'No registrada'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Método de pago</span>
                  <span className="text-sm font-medium text-slate-700">
                    {detailFactura.metodoPago || detailFactura.metodo_pago || 'No registrado'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <button 
                onClick={() => setDetailFactura(null)} 
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
