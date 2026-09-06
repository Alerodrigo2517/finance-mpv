import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { crearFactura } from '@/lib/services/facturas.service';
import { obtenerFacturasPorUsuario } from '@/lib/selectors/facturas.selector';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    // 1. Llamar al Selector (sin lógica de base de datos directa aquí)
    // const { searchParams } = new URL(request.url);
    // const estado = searchParams.get('estado') || undefined;
    const facturas = await obtenerFacturasPorUsuario((session.user as any).id);
    
    return NextResponse.json(facturas);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener facturas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    // 1. Validar input (Manual, simplificado)
    if (!data.servicioId || !data.monto || !data.fechaVencimiento || !data.periodoDesde || !data.periodoHasta) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // 2. Llamar al Service (sin lógica de negocio/Prisma aquí)
    const nuevaFactura = await crearFactura({
      servicioId: data.servicioId,
      periodoDesde: new Date(data.periodoDesde),
      periodoHasta: new Date(data.periodoHasta),
      fechaVencimiento: new Date(data.fechaVencimiento),
      monto: parseFloat(data.monto),
    }, (session.user as any).id);

    // 3. Devolver respuesta
    return NextResponse.json(nuevaFactura, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al registrar factura' }, { status: 500 });
  }
}
