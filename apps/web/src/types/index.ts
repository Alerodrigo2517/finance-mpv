export interface Movimiento {
  id: string;
  usuario_id?: string;
  tipo: 'INGRESO' | 'EGRESO';
  monto: number;
  categoria: string;
  descripcion?: string;
  origen?: string;
  fecha: string | Date;
  created_at?: string;
}

export interface Factura {
  id: string;
  servicio_id?: string;
  servicioId?: string;
  monto: number;
  fecha_vencimiento?: string;
  fechaVencimiento?: string;
  periodo_desde?: string;
  periodoDesde?: string;
  periodo_hasta?: string;
  periodoHasta?: string;
  estado: 'PENDIENTE' | 'PAGADA' | 'VENCIDA';
  kwConsumidos?: number;
  archivo_url?: string;
  archivoUrl?: string;
  comprobante_url?: string;
  comprobanteUrl?: string;
  metodo_pago?: string;
  metodoPago?: string;
  fecha_pago?: string;
  fechaPago?: string;
  created_at?: string;
}

export interface Servicio {
  id: string;
  usuario_id?: string;
  nombre_proveedor?: string;
  nombreProveedor?: string;
  tipo?: string;
  created_at?: string;
  facturas?: Factura[];
}

export interface Cuota {
  id: string;
  deuda_id?: string;
  numero_cuota: number;
  monto: number;
  fecha_vencimiento?: string;
  fechaVencimiento?: string;
  estado: 'PENDIENTE' | 'PAGADA';
  created_at?: string;
}

export interface Deuda {
  id: string;
  usuario_id?: string;
  nombre: string;
  monto_total?: number;
  montoTotal?: number;
  monto_cuota?: number;
  cantidad_cuotas?: number;
  fecha_inicio?: string;
  fechaInicio?: string;
  created_at?: string;
  cuotas?: Cuota[];
}

export interface ComponenteVehiculo {
  id: string;
  vehiculo_id?: string;
  nombre?: string;
  tipoComponente?: string;
  kmVidaUtil?: number;
  vidaUtilKm?: number;
  kmUltimoCambio?: number;
  kmInstalacion?: number;
  estado?: string;
  created_at?: string;
}

export interface ReparacionVehiculo {
  id: string;
  vehiculo_id?: string;
  fecha: string;
  descripcion: string;
  costo: number;
  taller?: string;
  created_at?: string;
}

export interface CombustibleVehiculo {
  id: string;
  vehiculo_id?: string;
  fecha: string;
  litros: number;
  costo_total: number;
  precio_litro?: number;
  kilometraje_momento?: number;
  created_at?: string;
}

export interface Vehiculo {
  id: string;
  usuario_id?: string;
  marca: string;
  modelo: string;
  anio: number;
  kilometrajeActual?: number;
  kilometraje_actual?: number;
  patente?: string;
  created_at?: string;
  componentes?: ComponenteVehiculo[];
  reparaciones?: ReparacionVehiculo[];
  combustibles?: CombustibleVehiculo[];
}

export interface Stock {
  id: string;
  producto_id?: string;
  cantidad: number;
  precio_compra?: number;
  fecha_ingreso?: string;
  created_at?: string;
}

export interface Producto {
  id: string;
  usuario_id?: string;
  nombre: string;
  categoria: string;
  codigo_barra?: string;
  codigoBarra?: string;
  created_at?: string;
  stocks?: Stock[];
}
