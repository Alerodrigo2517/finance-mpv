import BlankState from '@/components/ui/BlankState';
import PageHeader from '@/components/ui/PageHeader';
import { CreditCard } from 'lucide-react';

export default function DeudasPage() {
  return (
    <div className="flex flex-col h-full gap-6">
      <PageHeader title="Deudas" />
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 flex items-center justify-center">
        <BlankState
          variant="no-debts"
          Icon={CreditCard}
          title="No tenés deudas cargadas"
          description="Registrá un préstamo o compra en cuotas para hacerle seguimiento acá."
          action={
            <button className="bg-secondary hover:bg-secondaryHover text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-sm">
              + Nueva deuda / préstamo
            </button>
          }
        />
      </div>
    </div>
  );
}
