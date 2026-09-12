'use client';

import React, { useState, useEffect } from 'react';

type ConfirmDeleteDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
};

export function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Eliminar elemento?',
  description = '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
}: ConfirmDeleteDialogProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setStatus('loading');
      await onConfirm();
      setStatus('success');
      // Wait a moment to show the success state before closing
      setTimeout(() => {
        onClose();
        // Reset state after animation finishes
        setTimeout(() => setStatus('idle'), 300);
      }, 1200);
    } catch (error) {
      console.error('Error deleting item:', error);
      setStatus('idle');
      // Optionally could add an 'error' state here
    }
  };

  const handleClose = () => {
    if (status !== 'loading') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* Icon Circle */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${
              status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {status === 'success' ? (
                <svg className="w-8 h-8 animate-in zoom-in duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : status === 'loading' ? (
                <svg className="w-8 h-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {status === 'success' ? '¡Eliminado!' : title}
            </h3>
            
            <p className={`text-slate-500 transition-opacity duration-300 ${status === 'success' ? 'opacity-0' : 'opacity-100'}`}>
              {description}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
          {status === 'success' ? (
            <button
              onClick={handleClose}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors w-full"
            >
              Cerrar
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                disabled={status === 'loading'}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={status === 'loading'}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm shadow-red-200 transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Borrando...
                  </>
                ) : (
                  'Sí, eliminar'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
