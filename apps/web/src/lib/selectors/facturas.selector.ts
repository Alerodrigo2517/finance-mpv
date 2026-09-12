import { createClient } from '@/utils/supabase/server';

/**
 * Obtiene todas las facturas de un usuario, opcionalmente filtradas por estado.
 */
export async function obtenerFacturasPorUsuario(
  usuarioId: string,
  estado?: string
): Promise<any[]> {
  const supabase = await createClient();

  let query = supabase
    .from('factura_servicios')
    .select('*, servicio:servicios!inner(*)')
    .eq('servicios.usuario_id', usuarioId)
    .order('fecha_vencimiento', { ascending: true });

  if (estado) {
    query = query.eq('estado', estado);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error in obtenerFacturasPorUsuario', error);
    return [];
  }
  
  return data || [];
}

/**
 * Calcula el total adeudado en facturas pendientes o vencidas por el usuario.
 */
export async function calcularTotalAdeudadoFacturas(
  usuarioId: string
): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('factura_servicios')
    .select('monto, servicio:servicios!inner(usuario_id)')
    .eq('servicios.usuario_id', usuarioId)
    .in('estado', ['PENDIENTE', 'VENCIDA']);

  if (error) {
    console.error('Error in calcularTotalAdeudadoFacturas', error);
    return 0;
  }

  return (data || []).reduce((acc, factura) => acc + (factura.monto || 0), 0);
}
