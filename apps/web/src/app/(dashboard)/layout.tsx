import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { Wallet, Bell, Grid, MoreHorizontal } from 'lucide-react';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar Fijo (Drawer lateral) - Oculto en móviles */}
      <aside className="hidden md:flex w-[260px] flex-shrink-0 bg-white border-r border-slate-200 flex-col p-6 pb-12 gap-4 z-10 h-full overflow-y-auto shadow-sm">
        <div className="text-2xl font-bold mb-8 flex items-center gap-2">
          <span className="text-[#0F3160]">Finance</span><span className="text-primary">MVP</span>
        </div>
        
        <nav className="flex flex-col gap-1 flex-1">
          <Link href="/" className="px-4 py-3 rounded-xl text-[#0F3160] bg-blue-50 border-l-4 border-primary font-bold transition-all">
            Dashboard
          </Link>
          <Link href="/movimientos" className="px-4 py-3 rounded-xl text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1 transition-all">
            Movimientos
          </Link>
          <Link href="/servicios" className="px-4 py-3 rounded-xl text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1 transition-all">
            Servicios & Deudas
          </Link>
          <Link href="/herramientas" className="px-4 py-3 rounded-xl text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1 transition-all">
            Herramientas
          </Link>
          <Link href="/configuracion" className="px-4 py-3 rounded-xl text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1 transition-all">
            Configuración
          </Link>
          
          <LogoutButton />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 relative">
        {/* Adornos de fondo suaves e integrados para Light Mode */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-200 rounded-full blur-[100px] -z-10 opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-rose-200 rounded-full blur-[120px] -z-10 opacity-30"></div>
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-indigo-200 rounded-full blur-[80px] -z-10 opacity-20"></div>
        {children}
      </main>

      {/* Bottom Navigation Bar (Sólo visible en móviles) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center p-2 pb-6 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Link href="/" className="flex flex-col items-center p-2 text-slate-400 hover:text-[#0F3160]">
          <Wallet className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Resumen</span>
        </Link>
        <Link href="/alertas" className="flex flex-col items-center p-2 text-slate-400 hover:text-[#0F3160]">
          <Bell className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Alertas</span>
        </Link>
        <Link href="/herramientas" className="flex flex-col items-center p-2 text-[#0F3160] border-t-2 border-[#0F3160] -mt-[2px]">
          <Grid className="w-6 h-6 mb-1 fill-[#0F3160]/10" />
          <span className="text-[10px] font-bold">Herramientas</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center p-2 text-slate-400 hover:text-[#0F3160]">
          <MoreHorizontal className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Más</span>
        </Link>
      </nav>
    </div>
  );
}
