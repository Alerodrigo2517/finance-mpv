'use client';

import { useState, useEffect } from 'react';
import { Wallet, Receipt, TrendingUp, Rocket, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface OnboardingDialogProps {
  isOpen: boolean;
}

export default function OnboardingDialog({ isOpen }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to allow the fade-in animation
      const timer = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;
  if (!show) return null; // Wait for initial render to animate

  const steps = [
    {
      title: '¡Bienvenido a tu panel!',
      description: 'Acabas de dar el primer paso para organizar tus finanzas personales. Te guiaremos brevemente por las funciones principales del sistema.',
      icon: <Wallet className="w-16 h-16 text-blue-500 mb-4" strokeWidth={1.5} />,
      color: 'bg-blue-50',
      accent: 'text-blue-500'
    },
    {
      title: 'Servicios Fijos',
      description: 'En el menú "Servicios" podrás agregar tus gastos fijos (luz, gas, internet). Incluso puedes escanear facturas o subir PDFs para que la IA extraiga los datos por ti.',
      icon: <Receipt className="w-16 h-16 text-emerald-500 mb-4" strokeWidth={1.5} />,
      color: 'bg-emerald-50',
      accent: 'text-emerald-500'
    },
    {
      title: 'Movimientos Diarios',
      description: 'En "Movimientos" podrás registrar tus ingresos y gastos del día a día (supermercado, salidas, sueldo) para saber exactamente a dónde va tu dinero.',
      icon: <TrendingUp className="w-16 h-16 text-purple-500 mb-4" strokeWidth={1.5} />,
      color: 'bg-purple-50',
      accent: 'text-purple-500'
    },
    {
      title: '¡Todo listo para despegar!',
      description: 'Tu sistema está vacío en este momento. Cierra esta ventana y haz clic en "Cargar Movimiento" o dirígete a "Servicios" para comenzar a armar tu historial.',
      icon: <Rocket className="w-16 h-16 text-[#0F3160] mb-4" strokeWidth={1.5} />,
      color: 'bg-slate-100',
      accent: 'text-[#0F3160]'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShow(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        
        {/* Progress bar top */}
        <div className="w-full h-1.5 bg-slate-100 flex">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <button 
          onClick={() => setShow(false)} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 sm:p-10 flex flex-col items-center text-center">
          
          {/* Icon Container with animation */}
          <div key={currentStep} className="animate-in slide-in-from-right-4 fade-in duration-300">
            <div className={`p-6 rounded-full ${current.color} mb-6 relative overflow-hidden group`}>
              <div className="absolute inset-0 bg-white/40 blur-xl group-hover:bg-white/60 transition-colors"></div>
              <div className="relative z-10">
                {current.icon}
              </div>
            </div>
          </div>

          <h2 key={`title-${currentStep}`} className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4 tracking-tight animate-in slide-in-from-right-4 fade-in duration-300">
            {current.title}
          </h2>
          
          <p key={`desc-${currentStep}`} className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8 animate-in slide-in-from-right-4 fade-in duration-300 delay-75">
            {current.description}
          </p>

          <div className="flex items-center justify-between w-full mt-4 gap-4">
            <button 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            
            <button 
              onClick={handleNext}
              className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex justify-center items-center gap-2 transform active:scale-[0.98]
                ${currentStep === steps.length - 1 ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/20 hover:shadow-emerald-500/40' : 'bg-gradient-to-r from-[#0F3160] to-[#1a4a8f] shadow-blue-900/20 hover:shadow-blue-900/40'}`}
            >
              {currentStep === steps.length - 1 ? '¡Comenzar!' : 'Siguiente'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
