import { fetchApi } from './client';

export type Factura = {
  id: string;
  servicioId: string;
  periodoDesde: string;
  periodoHasta: string;
  fechaVencimiento: string;
  monto: number;
  estado: string;
  fechaPago?: string | null;
  servicio?: any;
};

export type CrearFacturaPayload = {
  servicioId: string;
  periodoDesde: string;
  periodoHasta: string;
  fechaVencimiento: string;
  monto: number;
};

export const getFacturas = () => {
  return fetchApi<Factura[]>('/facturas');
};

export const crearFactura = (payload: CrearFacturaPayload) => {
  return fetchApi<Factura>('/facturas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const actualizarEstadoFactura = (id: string, estado: string) => {
  return fetchApi<Factura>(`/facturas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
};
