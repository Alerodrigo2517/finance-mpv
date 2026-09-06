import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { nombre, apellido, email, password } = data;

    if (!email || !password || !nombre) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
    }

    const contrasenaHash = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        apellido: apellido || '',
        email,
        contrasena: contrasenaHash,
      },
    });

    // Removemos la contraseña del objeto de respuesta por seguridad
    const { contrasena, ...userWithoutPass } = usuario;
    
    return NextResponse.json(userWithoutPass, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 });
  }
}
