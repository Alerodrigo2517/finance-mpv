import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const usuarioId = session.user.id;

    const data = await request.json();
    const { servicioId, monto, fechaVencimiento, periodoDesde, periodoHasta, kwConsumidos } = data;

    if (!servicioId || !monto || !fechaVencimiento) {
      return NextResponse.json({ error: 'Faltan datos obligatorios (servicioId, monto, fechaVencimiento)' }, { status: 400 });
    }

    // Verificar que el servicio pertenezca al usuario
    const servicio = await prisma.servicio.findFirst({
      where: { id: servicioId, usuarioId }
    });

    if (!servicio) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
    }

    const factura = await prisma.facturaServicio.create({
      data: {
        servicioId,
        monto: parseFloat(monto),
        fechaVencimiento: new Date(fechaVencimiento),
        periodoDesde: periodoDesde ? new Date(periodoDesde) : new Date(),
        periodoHasta: periodoHasta ? new Date(periodoHasta) : new Date(),
        kwConsumidos: kwConsumidos ? parseFloat(kwConsumidos) : null,
        estado: 'PENDIENTE',
      }
    });

    // Create Alerta (5 días antes del vencimiento)
    const fechaVenc = new Date(fechaVencimiento);
    const fechaAlerta = new Date(fechaVenc);
    fechaAlerta.setDate(fechaAlerta.getDate() - 5);
    
    await prisma.alerta.create({
      data: {
        tipoAlerta: 'VENCIMIENTO_FACTURA',
        descripcion: `Tu factura de ${servicio.nombreProveedor} por $${monto} vence el ${fechaVenc.toLocaleDateString()}`,
        fecha: fechaAlerta,
        estado: 'NO_LEIDA',
        referenciaId: factura.id,
        usuarioId
      }
    });

    return NextResponse.json({ success: true, factura });
  } catch (error: unknown) {
    console.error('Error creando factura manual:', error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Error interno' }, { status: 500 });
  }
}
