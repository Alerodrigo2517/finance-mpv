import { prisma } from '@/lib/prisma';
import { FacturaServicio } from '@prisma/client';

export type CrearFacturaData = {
  servicioId: string;
  periodoDesde: Date;
  periodoHasta: Date;
  fechaVencimiento: Date;
  monto: number;
};

/**
 * Crea una nueva factura para un servicio.
 * Asegura que el servicio pertenezca al usuario especificado.
 */
export async function crearFactura(
  data: CrearFacturaData,
  usuarioId: string
): Promise<FacturaServicio> {
  // Opcional: Validar que el servicio pertenezca al usuario
  const servicio = await prisma.servicio.findUnique({
    where: { id: data.servicioId },
  });

  if (!servicio || servicio.usuarioId !== usuarioId) {
    throw new Error('Servicio no encontrado o no pertenece al usuario');
  }

  return prisma.facturaServicio.create({
    data: {
      ...data,
      estado: 'PENDIENTE',
    },
  });
}

/**
 * Marca una factura como pagada.
 */
export async function marcarFacturaComoPagada(
  facturaId: string,
  fechaPago: Date,
  usuarioId: string
): Promise<FacturaServicio> {
  const factura = await prisma.facturaServicio.findUnique({
    where: { id: facturaId },
    include: { servicio: true },
  });

  if (!factura || factura.servicio.usuarioId !== usuarioId) {
    throw new Error('Factura no encontrada o no pertenece al usuario');
  }

  return prisma.facturaServicio.update({
    where: { id: facturaId },
    data: {
      estado: 'PAGADA',
      fechaPago,
    },
  });
}

/**
 * Actualiza el estado de una factura.
 */
export async function actualizarEstadoFactura(
  facturaId: string,
  estado: string,
  usuarioId: string
): Promise<FacturaServicio> {
  const factura = await prisma.facturaServicio.findUnique({
    where: { id: facturaId },
    include: { servicio: true },
  });

  if (!factura || factura.servicio.usuarioId !== usuarioId) {
    throw new Error('Factura no encontrada o no pertenece al usuario');
  }

  const dataToUpdate: import('@prisma/client').Prisma.FacturaServicioUpdateInput = { estado };
  if (estado === 'PAGADA') {
    dataToUpdate.fechaPago = new Date();
  } else if (estado === 'PENDIENTE') {
    dataToUpdate.fechaPago = null;
  }

  return prisma.facturaServicio.update({
    where: { id: facturaId },
    data: dataToUpdate,
  });
}

