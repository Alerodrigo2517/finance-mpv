'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CardIllustration } from '@/components/CardIllustration';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-white">
      {/* Left Panel: Branding & Illustration (Split Screen) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 relative flex-col items-center justify-center p-12 border-r border-slate-100">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary rounded-full blur-[100px] opacity-10"></div>
        
        <div className="z-10 flex flex-col items-center max-w-lg text-center">
          <div className="w-full max-w-[450px] mt-12 mb-10 hover:scale-105 transition-transform duration-700">
            <CardIllustration />
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-slate-800 mb-5 tracking-tight">
            Bienvenido a <span className="text-primary">Finance</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Gestiona tu dinero y alcanza tus metas financieras de forma rápida y segura en un solo lugar.
          </p>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative bg-white">
        {/* Subtle background glow */}
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
        
        <div className="w-full max-w-[400px] z-10">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Iniciar Sesión</h2>
            <p className="text-slate-500">Ingresa tus credenciales para continuar</p>
          </div>

          {error && <div className="bg-danger/10 text-danger p-4 rounded-lg text-sm border border-danger/20 mb-6 font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Correo electrónico</label>
              <input 
                type="email" 
                required 
                placeholder="ejemplo@correo.com"
                className="input-field py-3.5 px-4 bg-slate-50 border-slate-200 placeholder:text-slate-400 text-slate-800 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Contraseña</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="input-field py-3.5 px-4 bg-slate-50 border-slate-200 placeholder:text-slate-400 text-slate-800 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary mt-4 py-4 text-lg font-bold rounded-lg w-full shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
              Entrar
            </button>
          </form>

          <div className="text-center mt-6">
            <a href="#" className="text-primary font-medium text-sm hover:underline transition-all">¿Has olvidado tu contraseña?</a>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400">o</span>
            </div>
          </div>

          <div className="flex justify-center">
            <Link href="/register" className="btn-secondary w-full text-center py-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold shadow-sm transition-all duration-300 hover:-translate-y-0.5">
              Crear cuenta nueva
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
