'use client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button 
      onClick={handleSignOut} 
      className="px-4 py-2 mt-auto text-sm text-danger hover:bg-danger/10 rounded-xl font-medium transition-all text-left flex items-center gap-3"
    >
      <LogOut className="w-5 h-5" />
      Cerrar Sesión
    </button>
  );
}
