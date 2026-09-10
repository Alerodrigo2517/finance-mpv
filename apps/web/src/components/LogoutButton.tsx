'use client';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut()} 
      className="px-4 py-2 mt-auto text-sm text-danger hover:bg-danger/10 rounded-xl font-medium transition-all text-left flex items-center gap-3"
    >
      <LogOut className="w-5 h-5" />
      Cerrar Sesión
    </button>
  );
}
