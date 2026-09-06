'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellido, email, password }),
      });

      if (res.ok) {
        router.push('/login');
      } else {
        const data = await res.json();
        setError(data.error || 'Error al registrarse');
      }
    } catch (e) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center relative">
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-primary rounded-full blur-[100px] -z-10 opacity-20"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-secondary rounded-full blur-[100px] -z-10 opacity-20"></div>
      
      <div className="glass-panel p-10 flex flex-col gap-6 w-full max-w-md z-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Crear Cuenta</h1>
          <p className="text-slate-400">Únete para tomar el control de tus finanzas</p>
        </div>

        {error && <div className="bg-danger/20 text-danger p-3 rounded-md text-sm border border-danger/50">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-300">Nombre</label>
              <input type="text" required className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-300">Apellido</label>
              <input type="text" required className="input-field" value={apellido} onChange={(e) => setApellido(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Correo Electrónico</label>
            <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Contraseña</label>
            <input type="password" required minLength={6} className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-4">
          ¿Ya tienes cuenta? <Link href="/login" className="text-primary hover:underline">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
}
