'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <div className="flex min-h-screen items-center justify-center relative">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary rounded-full blur-[100px] -z-10 opacity-20"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary rounded-full blur-[100px] -z-10 opacity-20"></div>
      
      <div className="glass-panel p-10 flex flex-col gap-6 w-full max-w-md z-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Bienvenido</h1>
          <p className="text-slate-400">Inicia sesión en tu cuenta financiera</p>
        </div>

        {error && <div className="bg-danger/20 text-danger p-3 rounded-md text-sm border border-danger/50">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Correo Electrónico</label>
            <input 
              type="email" 
              required 
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Contraseña</label>
            <input 
              type="password" 
              required 
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary mt-2">Ingresar</button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-4">
          ¿No tienes una cuenta? <Link href="/register" className="text-primary hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
