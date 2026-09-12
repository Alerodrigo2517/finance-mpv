import { createClient } from '@/utils/supabase/server';
import { Movimiento } from '@/types';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let movimientos: Movimiento[] = [];
  let ingresosMes = 0;
  let egresosMes = 0;
  let saldo = 0;
  
  try {
    if (user) {
      const { data, error } = await supabase
        .from('movimientos')
        .select('*')
        .eq('usuario_id', user.id);
      
      if (!error && data) {
        movimientos = data;
      }
    }
  } catch (error) {
    console.error('Error conectando a la BD. Mostrando datos mockeados:', error);
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  movimientos.forEach(m => {
    // Saldo histórico global
    if (m.tipo === 'INGRESO') saldo += m.monto;
    else if (m.tipo === 'EGRESO') saldo -= m.monto;

    // Ingresos y egresos específicamente de este mes
    const [yearStr, monthStr] = m.fecha.split('T')[0].split('-');
    const mYear = parseInt(yearStr, 10);
    const mMonth = parseInt(monthStr, 10) - 1; // 0-indexed for JS compatibility

    if (mMonth === currentMonth && mYear === currentYear) {
      if (m.tipo === 'INGRESO') ingresosMes += m.monto;
      else if (m.tipo === 'EGRESO') egresosMes += m.monto;
    }
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Hero Section */}
      <div className="bg-[#0F3160] rounded-3xl p-6 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Adorno visual sutil de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        
        <div className="z-10 flex flex-col gap-2">
          <span className="text-blue-200 font-medium text-lg uppercase tracking-wider">
            Resumen de tu mes
          </span>
          <div className="flex items-baseline gap-2 md:gap-3">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              {saldo.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
            </h1>
            <span className={`text-xl font-medium ${saldo >= 0 ? 'text-primary' : 'text-danger'}`}>
              Saldo Actual
            </span>
          </div>
          
          <div className="flex gap-6 mt-4">
            <div className="flex flex-col">
              <span className="text-blue-200/70 text-sm">Ingresos</span>
              <span className="text-white font-semibold text-xl">+{ingresosMes.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
            </div>
            <div className="w-px h-10 bg-white/20 self-center"></div>
            <div className="flex flex-col">
              <span className="text-blue-200/70 text-xs md:text-sm">Egresos</span>
              <span className="text-white font-semibold text-lg md:text-xl">-{egresosMes.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
            </div>
          </div>
        </div>

        <div className="z-10 mt-2 md:mt-0 w-full md:w-auto">
          <a href="/resumenes" className="w-full justify-center md:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all font-medium py-3 px-6 rounded-xl inline-flex items-center gap-2 backdrop-blur-sm">
            Ver resumen completo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </a>
        </div>
      </div>

      {/* Main Content Area para el Dashboard */}
      <div className="flex gap-4">
        {/* Aquí irían las listas recientes (movimientos, alertas) */}
        <div className="glass-panel p-4 md:p-8 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#0F3160]">Últimos Movimientos</h2>
            <a href="/movimientos" className="text-primary hover:text-primaryHover font-medium text-sm transition-colors">Ver todos</a>
          </div>
          
          {movimientos.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              Todavía no cargaste ningún gasto este mes.
            </div>
          ) : (
             <div className="space-y-3 mt-4">
               {movimientos.slice(0, 5).map((m) => (
                 <div key={m.id} className="flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors p-4 rounded-xl border border-slate-100">
                   <div className="flex flex-col">
                     <span className="font-bold text-slate-800 text-sm">{m.categoria}</span>
                     <span className="text-xs text-slate-500 font-medium mt-0.5">
                       {new Date(m.fecha).toLocaleDateString()} {m.descripcion ? `• ${m.descripcion}` : ''}
                     </span>
                   </div>
                   <span className={`font-bold tracking-tight ${m.tipo === 'INGRESO' ? 'text-primary' : 'text-danger'}`}>
                     {m.tipo === 'INGRESO' ? '+' : '-'}{Number(m.monto).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                   </span>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>
      
      {/* Botón Flotante (CTA Principal) */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-30">
        <a href="/movimientos" className="bg-primary hover:bg-primaryHover text-[#0b0f19] p-4 rounded-full shadow-lg shadow-primary/20 flex items-center justify-center transition-transform hover:scale-105 group">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          {/* Tooltip on hover */}
          <span className="absolute right-full mr-4 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
            Cargar Movimiento
          </span>
        </a>
      </div>
    </div>
  );
}
