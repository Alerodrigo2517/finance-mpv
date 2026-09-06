import { prisma } from '@/lib/prisma';
import { FacturaServicio } from '@prisma/client';

/**
 * Obtiene todas las facturas de un usuario, opcionalmente filtradas por estado.
 */
export async function obtenerFacturasPorUsuario(
  usuarioId: string,
  estado?: string
): Promise<FacturaServicio[]> {
  const whereClause: any = {
    servicio: {
      usuarioId,
    },
  };

  if (estado) {
    whereClause.estado = estado;
  }

  return prisma.facturaServicio.findMany({
    where: whereClause,
    include: {
      servicio: true,
    },
    orderBy: {
      fechaVencimiento: 'asc',
    },
  });
}

/**
 * Calcula el total adeudado en facturas pendientes o vencidas por el usuario.
 */
export async function calcularTotalAdeudadoFacturas(
  usuarioId: string
): Promise<number> {
  const result = await prisma.facturaServicio.aggregate({
    where: {
      servicio: { usuarioId },
      estado: { in: ['PENDIENTE', 'VENCIDA'] },
    },
    _sum: {
      monto: true,
    },
  });

  return result._sum.monto || 0;
}
