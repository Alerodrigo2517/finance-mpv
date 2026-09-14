import { Loader2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#0F3160]'}`}>
            <AlertCircle className="w-8 h-8" />
          </div>
          
          <h3 className="text-xl font-extrabold text-slate-800">
            {title}
          </h3>
          
          <p className="text-sm text-slate-500 leading-relaxed max-w-[260px]">
            {message}
          </p>
        </div>

        <div className="p-4 flex gap-3 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 text-sm font-bold text-white rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-[#0F3160] hover:bg-[#0a244a]'
            } disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isLoading ? 'Cargando...' : confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
