import React from 'react';
import ActionCard from '@/components/ui/ActionCard';
import { ShoppingBag, ReceiptText, CarFront } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

export default function HerramientasPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto md:mt-4">
      <div className="text-center md:text-left mb-2">
        <h1 className="text-2xl font-bold text-[#0F3160]">Herramientas</h1>
        <p className="text-sm text-slate-500 mt-1">Gestión de recursos del hogar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ActionCard 
          title="Lista de compras"
          subtitle="12 productos - 2 por vencer"
          Icon={ShoppingBag}
          href="/stock"
        />

        <ActionCard 
          title="Vehículos"
          subtitle="Cambio de aceite en 150 km"
          Icon={CarFront}
          href="/vehiculos"
        />
      </div>
    </div>
  );
}
