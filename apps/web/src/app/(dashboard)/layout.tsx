'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import { Wallet, Bell, Grid, MoreHorizontal, LayoutDashboard, ArrowRightLeft, Receipt, Settings, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/movimientos', label: 'Movimientos', icon: ArrowRightLeft },
    { href: '/servicios', label: 'Servicios', icon: Receipt },
    { href: '/herramientas', label: 'Herramientas', icon: Grid },
    { href: '/configuracion', label: 'Configuración', icon: Settings },
  ];

  const mobileNavItems = [
    { href: '/', label: 'Resumen', icon: LayoutDashboard },
    { href: '/movimientos', label: 'Movimientos', icon: ArrowRightLeft },
    { href: '/servicios', label: 'Servicios', icon: Receipt },
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar Fijo (Drawer lateral) - Oculto en móviles */}
      <aside className="hidden md:flex w-[260px] flex-shrink-0 bg-white border-r border-slate-200 flex-col p-6 pb-12 gap-4 z-10 h-full overflow-y-auto shadow-sm">
        <div className="text-2xl font-bold mb-8 flex items-center gap-2">
          <span className="text-[#0F3160]">Finance</span><span className="text-primary">MVP</span>
        </div>
        
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                  isActive 
                    ? 'text-[#0F3160] bg-blue-50 border-l-4 border-primary font-bold' 
                    : 'text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center p-2 pb-6 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex flex-col items-center p-2 flex-1 ${
                isActive 
                  ? 'text-[#0F3160] border-t-2 border-[#0F3160] -mt-[2px]' 
                  : 'text-slate-400 hover:text-[#0F3160]'
              }`}
            >
              <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-[#0F3160]/10' : ''}`} />
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </Link>
          );
        })}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center p-2 flex-1 ${
            mobileMenuOpen 
              ? 'text-[#0F3160] border-t-2 border-[#0F3160] -mt-[2px]' 
              : 'text-slate-400 hover:text-[#0F3160]'
          }`}
        >
          <MoreHorizontal className="w-6 h-6 mb-1" />
          <span className={`text-[10px] ${mobileMenuOpen ? 'font-bold' : 'font-medium'}`}>Más</span>
        </button>
      </nav>

      {/* Mobile More Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm animate-in fade-in flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 pb-24 shadow-2xl transform animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#0F3160]">Menú</h3>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/herramientas" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium">
                <Grid className="w-5 h-5 text-slate-400" /> Herramientas
              </Link>
              <Link href="/configuracion" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium">
                <Settings className="w-5 h-5 text-slate-400" /> Configuración
              </Link>
              <div className="h-px bg-slate-100 my-2"></div>
              <div className="p-2" onClick={() => setMobileMenuOpen(false)}>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
