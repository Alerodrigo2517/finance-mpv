import React from 'react';
import { LucideIcon } from 'lucide-react';

export type BlankStateVariant = 'not-found' | 'no-debts' | 'no-alerts' | 'empty-cart' | 'generic';

type BlankStateProps = {
  title: string;
  description: string;
  Icon: LucideIcon;
  variant: BlankStateVariant;
  action?: React.ReactNode;
};

export default function BlankState({ title, description, Icon, variant, action }: BlankStateProps) {
  // Configurar colores del badge según la variante
  const getBadgeStyle = () => {
    switch (variant) {
      case 'not-found':
      case 'empty-cart':
        return 'bg-primary text-white'; // Rojo
      case 'no-alerts':
        return 'bg-green-600 text-white'; // Verde
      case 'no-debts':
        return 'bg-white border-2 border-slate-200 text-primary'; // Blanco con ícono rojo
      default:
        return 'bg-slate-800 text-white';
    }
  };

  const getBadgeIcon = () => {
    switch (variant) {
      case 'not-found':
        return '?';
      case 'empty-cart':
        return '×';
      case 'no-alerts':
      case 'no-debts':
        return '✓';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[400px]">
      <div className="relative mb-6">
        {/* Adornos de fondo integrados al diseño general */}
        <div className="absolute top-[-20%] left-[-20%] w-20 h-20 bg-blue-200 rounded-full blur-xl -z-10 opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-16 h-16 bg-rose-200 rounded-full blur-xl -z-10 opacity-50"></div>
        
        {/* Círculo celeste principal */}
        <div className="w-32 h-32 rounded-full bg-white/60 backdrop-blur-sm border border-white flex items-center justify-center shadow-sm">
          <Icon className="w-16 h-16 text-secondary" strokeWidth={1.5} />
        </div>
        
        {/* Badge flotante */}
        <div className={`absolute top-2 right-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${getBadgeStyle()}`}>
          {getBadgeIcon()}
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      
      <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed mb-8">
        {description}
      </p>

      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
