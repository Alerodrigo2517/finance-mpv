'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CardIllustration } from '@/components/CardIllustration';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Left Panel: Branding & Illustration (Split Screen) */}
      <div className="hidden md:flex md:w-1/2 xl:w-3/5 bg-slate-50 relative flex-col items-center justify-center p-6 lg:p-10 border-r border-slate-100">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] bg-primary rounded-full blur-[100px] opacity-10"></div>
        
        <div className="z-10 flex flex-col items-center max-w-2xl text-center">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-slate-800 mt-4 mb-6 tracking-tight">
            Bienvenido a <span className="text-primary">Finance</span>
          </h1>
          <div className="w-full max-w-[250px] lg:max-w-[320px] xl:max-w-[400px] mb-6 hover:scale-105 transition-transform duration-700">
            <CardIllustration />
          </div>
          <p className="text-base lg:text-lg text-slate-500 font-medium leading-relaxed max-w-md">
            Gestiona tu dinero y alcanza tus metas financieras de forma rápida y segura en un solo lugar.
          </p>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full md:w-1/2 xl:w-2/5 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10 relative bg-white overflow-y-auto">
        {/* Subtle background glow */}
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-secondary rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
        
        <div className="w-full max-w-[380px] z-10">
          <div className="text-center lg:text-left mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Iniciar Sesión</h2>
            <p className="text-sm text-slate-500">Ingresa tus credenciales para continuar</p>
          </div>

          {error && <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm border border-danger/20 mb-4 font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Correo electrónico</label>
              <input 
                type="email" 
                required 
                placeholder="ejemplo@correo.com"
                className="input-field py-2.5 px-3.5 bg-slate-50 border-slate-200 placeholder:text-slate-400 text-slate-800 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Contraseña</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="input-field py-2.5 px-3.5 bg-slate-50 border-slate-200 placeholder:text-slate-400 text-slate-800 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary mt-2 py-3 text-base font-bold rounded-lg w-full shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
              Entrar
            </button>
          </form>

          <div className="text-center mt-4">
            <a href="#" className="text-primary font-medium text-sm hover:underline transition-all">¿Has olvidado tu contraseña?</a>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400">o</span>
            </div>
          </div>

          <div className="flex justify-center">
            <Link href="/register" className="btn-secondary w-full text-center py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold shadow-sm transition-all duration-300 hover:-translate-y-0.5 text-sm">
              Crear cuenta nueva
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
