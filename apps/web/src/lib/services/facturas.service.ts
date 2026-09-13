import { createClient } from '@/utils/supabase/server';
import { Factura } from '@/types';

export type CrearFacturaData = {
  servicioId: string;
  periodoDesde: Date;
  periodoHasta: Date;
  fechaVencimiento: Date;
  monto: number;
};

export type EditarFacturaData = {
  periodoDesde?: Date;
  periodoHasta?: Date;
  fechaVencimiento?: Date;
  monto?: number;
  kwConsumidos?: number;
};



/**
 * Crea una nueva factura para un servicio.
 * Asegura que el servicio pertenezca al usuario especificado.
 */
export async function crearFactura(
  data: CrearFacturaData,
  usuarioId: string
): Promise<Factura> {
  const supabase = await createClient();

  const { data: servicio } = await supabase
    .from('servicios')
    .select('usuario_id')
    .eq('id', data.servicioId)
    .single();

  if (!servicio || servicio.usuario_id !== usuarioId) {
    throw new Error('Servicio no encontrado o no pertenece al usuario');
  }

  const { data: nuevaFactura, error } = await supabase
    .from('factura_servicios')
    .insert({
      servicio_id: data.servicioId,
      periodo_desde: data.periodoDesde.toISOString(),
      periodo_hasta: data.periodoHasta.toISOString(),
      fecha_vencimiento: data.fechaVencimiento.toISOString(),
      monto: data.monto,
      estado: 'PENDIENTE',
    })
    .select()
    .single();

  if (error) throw error;
  return nuevaFactura;
}

/**
 * Marca una factura como pagada.
 */
export async function marcarFacturaComoPagada(
  facturaId: string,
  fechaPago: Date,
  usuarioId: string
): Promise<Factura> {
  const supabase = await createClient();

  // RLS will ensure user owns the factura if policies are set correctly, 
  // but we can also verify explicitly just in case.
  const { data: factura } = await supabase
    .from('factura_servicios')
    .select('*, servicios(usuario_id)')
    .eq('id', facturaId)
    .single();

  if (!factura || factura.servicios?.usuario_id !== usuarioId) {
    throw new Error('Factura no encontrada o no pertenece al usuario');
  }

  const { data: facturaActualizada, error } = await supabase
    .from('factura_servicios')
    .update({
      estado: 'PAGADA',
      fecha_pago: fechaPago.toISOString(),
    })
    .eq('id', facturaId)
    .select()
    .single();

  if (error) throw error;
  return facturaActualizada;
}

/**
 * Actualiza el estado de una factura.
 */
export async function actualizarEstadoFactura(
  facturaId: string,
  estado: string,
  usuarioId: string,
  metodoPago?: string
): Promise<Factura> {
  const supabase = await createClient();

  const { data: factura } = await supabase
    .from('factura_servicios')
    .select('*, servicios(usuario_id, nombre_proveedor)')
    .eq('id', facturaId)
    .single();

  if (!factura || factura.servicios?.usuario_id !== usuarioId) {
    throw new Error('Factura no encontrada o no pertenece al usuario');
  }

  const dataToUpdate: any = { estado: estado as Factura['estado'] };
  if (estado === 'PAGADA') {
    dataToUpdate.fecha_pago = new Date().toISOString();
    if (metodoPago) dataToUpdate.metodo_pago = metodoPago;
  } else if (estado === 'PENDIENTE') {
    dataToUpdate.fecha_pago = null;
    dataToUpdate.metodo_pago = null;
  }

  const { data: facturaActualizada, error } = await supabase
    .from('factura_servicios')
    .update(dataToUpdate)
    .eq('id', facturaId)
    .select()
    .single();

  if (error) throw error;

  if (estado === 'PAGADA' && factura.estado !== 'PAGADA') {
    await supabase.from('movimientos').insert({
      tipo: 'EGRESO',
      monto: factura.monto,
      categoria: 'Servicios',
      descripcion: `Pago de ${factura.servicios?.nombre_proveedor || 'servicio'}`,
      origen: 'MANUAL',
      usuario_id: usuarioId
    });
  }

  return facturaActualizada;
}

/**
 * Actualiza los datos completos de una factura.
 */
export async function editarFactura(
  facturaId: string,
  data: EditarFacturaData,
  usuarioId: string
): Promise<Factura> {
  const supabase = await createClient();

  const { data: factura } = await supabase
    .from('factura_servicios')
    .select('*, servicios(usuario_id)')
    .eq('id', facturaId)
    .single();

  if (!factura || factura.servicios?.usuario_id !== usuarioId) {
    throw new Error('Factura no encontrada o no pertenece al usuario');
  }

  const payload: any = {};
  if (data.monto !== undefined) payload.monto = data.monto;
  if (data.kwConsumidos !== undefined) payload.kw_consumidos = data.kwConsumidos;
  if (data.periodoDesde !== undefined) payload.periodo_desde = data.periodoDesde.toISOString();
  if (data.periodoHasta !== undefined) payload.periodo_hasta = data.periodoHasta.toISOString();
  if (data.fechaVencimiento !== undefined) payload.fecha_vencimiento = data.fechaVencimiento.toISOString();

  const { data: facturaActualizada, error } = await supabase
    .from('factura_servicios')
    .update(payload)
    .eq('id', facturaId)
    .select()
    .single();

  if (error) throw error;
  return facturaActualizada;
}

