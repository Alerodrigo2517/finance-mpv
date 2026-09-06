import BlankState from '@/components/ui/BlankState';
import PageHeader from '@/components/ui/PageHeader';
import { Bell } from 'lucide-react';

export default function AlertasPage() {
  return (
    <div className="flex flex-col h-full gap-6">
      <PageHeader title="Alertas" />
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 flex items-center justify-center">
        <BlankState
          variant="no-alerts"
          Icon={Bell}
          title="Sin alertas pendientes"
          description="Todo al día. Te avisamos apenas se acerque un vencimiento."
        />
      </div>
    </div>
  );
}
