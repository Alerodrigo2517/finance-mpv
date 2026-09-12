import { createClient } from '@/utils/supabase/server';
import PageHeader from '@/components/ui/PageHeader';
import { redirect } from 'next/navigation';
import MonthFilter from './MonthFilter';
import Link from 'next/link';
import HistoryModal from './HistoryModal';

export const dynamic = 'force-dynamic';

export default async function ResumenesPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  const usuarioId = user.id;

  const resolvedParams = await props.searchParams;
  const paramMes = resolvedParams.mes ? parseInt(resolvedParams.mes as string) : null;
  const paramAnio = resolvedParams.anio ? parseInt(resolvedParams.anio as string) : null;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const targetMes = paramMes || currentMonth;
  const targetAnio = paramAnio || currentYear;

  const startOfMonth = new Date(targetAnio, targetMes - 1, 1);
  const endOfMonth = new Date(targetAnio, targetMes, 0, 23, 59, 59);

  // Fetch movimientos del mes actual
  const { data: movimientosMes } = await supabase
    .from('movimientos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .gte('fecha', startOfMonth.toISOString())
    .lte('fecha', endOfMonth.toISOString());

  let ingresos = 0;
  let egresos = 0;
  const gastosPorCategoria: Record<string, number> = {};

  (movimientosMes || []).forEach(m => {
    if (m.tipo === 'INGRESO') {
      ingresos += m.monto;
    } else if (m.tipo === 'EGRESO') {
      egresos += m.monto;
      gastosPorCategoria[m.categoria] = (gastosPorCategoria[m.categoria] || 0) + m.monto;
    }
  });

  const saldo = ingresos - egresos;
  
  // Convertir objeto de categorías a array y ordenar de mayor a menor
  const categoriasOrdenadas = Object.entries(gastosPorCategoria)
    .map(([categoria, monto]) => ({ categoria, monto }))
    .sort((a, b) => b.monto - a.monto);

  // Agrupar movimientos pasados dinámicamente
  const { data: todosLosMovimientos } = await supabase
    .from('movimientos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('fecha', { ascending: false });

  const targetMonthKey = `${targetAnio}-${targetMes}`;
  const agrupado: Record<string, { id: string, mes: number, anio: number, totalIngresos: number, totalEgresos: number, saldo: number, estado: string }> = {};

  (todosLosMovimientos || []).forEach(m => {
    const date = new Date(m.fecha);
    const anio = date.getFullYear();
    const mes = date.getMonth() + 1;
    const key = `${anio}-${mes}`;

    // Excluir el mes actualmente visualizado
    if (key === targetMonthKey) return;

    if (!agrupado[key]) {
      agrupado[key] = {
        id: key,
        mes,
        anio,
        totalIngresos: 0,
        totalEgresos: 0,
        saldo: 0,
        estado: 'CERRADO' // Dinámico, asumimos cerrado si es de un mes anterior
      };
    }

    if (m.tipo === 'INGRESO') {
      agrupado[key].totalIngresos += m.monto;
    } else if (m.tipo === 'EGRESO') {
      agrupado[key].totalEgresos += m.monto;
    }
  });

  const historiales = Object.values(agrupado).map(h => {
    h.saldo = h.totalIngresos - h.totalEgresos;
    return h;
  });

  // Ordenar de más reciente a más antiguo
  historiales.sort((a, b) => {
    if (a.anio !== b.anio) return b.anio - a.anio;
    return b.mes - a.mes;
  });

  const formatCurrency = (monto: number) => {
    return monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  };

  const getMonthName = (month: number) => {
    const date = new Date(2000, month - 1, 1);
    return date.toLocaleString('es-ES', { month: 'long' });
  };

  const visibleHistoriales = historiales.slice(0, 3);

  return (
    <div key={targetMonthKey} className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader  
        title="Tu Resumen Financiero" 
        subtitle={`Estado de cuentas de ${getMonthName(targetMes)} ${targetAnio}`} 
        action={<MonthFilter />}
      />

      {/* Tarjetas de KPIs (Mes actual) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
          <span className="text-slate-500 font-medium text-sm">Saldo Actual</span>
          <span className={`text-3xl md:text-4xl font-bold ${saldo >= 0 ? 'text-slate-800' : 'text-danger'}`}>
            {formatCurrency(saldo)}
          </span>
        </div>

        <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
          <span className="text-slate-500 font-medium text-sm">Ingresos del mes</span>
          <span className="text-2xl font-bold text-green-600">
            +{formatCurrency(ingresos)}
          </span>
        </div>

        <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-danger/10 rounded-full blur-2xl group-hover:bg-danger/20 transition-all"></div>
          <span className="text-slate-500 font-medium text-sm">Egresos del mes</span>
          <span className="text-2xl font-bold text-danger">
            -{formatCurrency(egresos)}
          </span>
        </div>
      </div>

      {/* Desglose de Gastos */}
      <div className="glass-panel p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-800">
            Gastos por Categoría
          </h2>
          <Link 
            href={`/movimientos?mes=${targetMes}&anio=${targetAnio}`} 
            className="text-sm font-bold text-[#0F3160] hover:text-white bg-blue-50 hover:bg-[#0F3160] px-5 py-2.5 rounded-xl transition-colors border border-[#0F3160]/10 flex items-center gap-2"
          >
            Ver detalles de movimiento
          </Link>
        </div>
        
        {categoriasOrdenadas.length === 0 ? (
          <p className="text-slate-500 text-center py-6">No tienes egresos registrados este mes.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {categoriasOrdenadas.map(({ categoria, monto }) => {
              const porcentaje = egresos > 0 ? (monto / egresos) * 100 : 0;
              return (
                <div key={categoria} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-700 capitalize">{categoria.toLowerCase()}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-800">{formatCurrency(monto)}</span>
                      <span className="text-slate-400 w-12 text-right">{porcentaje.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historial de Resúmenes Anteriores */}
      <div className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-slate-800">Historial de Meses</h2>
        </div>
        
        {visibleHistoriales.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-500">
            Aún no tienes resúmenes de meses anteriores cerrados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleHistoriales.map((h) => (
              <Link key={h.id} href={`/resumenes?mes=${h.mes}&anio=${h.anio}`} className="glass-panel p-6 hover:border-primary/50 hover:shadow-md transition-all group block cursor-pointer">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 capitalize">{getMonthName(h.mes)} {h.anio}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${h.estado === 'CERRADO' ? 'bg-slate-100 text-slate-600' : 'bg-primary/10 text-primary'}`}>
                    {h.estado}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Saldo Final</span>
                    <span className={`font-semibold ${h.saldo >= 0 ? 'text-slate-800' : 'text-danger'}`}>
                      {formatCurrency(h.saldo)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-slate-100 pt-2">
                    <span className="text-slate-500">Ingresos</span>
                    <span className="text-green-600 font-medium">+{formatCurrency(h.totalIngresos)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Egresos</span>
                    <span className="text-danger font-medium">-{formatCurrency(h.totalEgresos)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {historiales.length > 3 && (
          <div className="flex justify-center mt-6">
            <HistoryModal historiales={historiales} />
          </div>
        )}
      </div>
    </div>
  );
}
