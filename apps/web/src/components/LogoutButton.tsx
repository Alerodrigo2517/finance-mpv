'use client';
import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut()} 
      className="px-4 py-2 mt-auto text-sm text-danger hover:bg-danger/10 rounded-xl font-medium transition-all text-left"
    >
      Cerrar Sesión
    </button>
  );
}
