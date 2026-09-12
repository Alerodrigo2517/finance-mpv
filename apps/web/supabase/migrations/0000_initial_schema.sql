-- Migration from Prisma to Supabase

-- Tables
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden ver su propio perfil" ON public.usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.usuarios FOR UPDATE USING (auth.uid() = id);

-- NOTA: El trigger para insertar usuarios cuando se registran en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, apellido, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'nombre', 'Usuario'), 
    COALESCE(new.raw_user_meta_data->>'apellido', ''), 
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Movimientos
CREATE TABLE public.movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL, -- 'INGRESO' | 'EGRESO'
    monto DOUBLE PRECISION NOT NULL,
    categoria TEXT NOT NULL,
    descripcion TEXT,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    origen TEXT NOT NULL, -- 'MANUAL' | 'WHATSAPP'
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE
);

ALTER TABLE public.movimientos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Movimientos RLS" ON public.movimientos FOR ALL USING (auth.uid() = usuario_id);
CREATE INDEX movimientos_usuario_id_idx ON public.movimientos(usuario_id);

-- Servicios
CREATE TABLE public.servicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL,
    nombre_proveedor TEXT NOT NULL,
    direccion TEXT,
    nro_cuenta TEXT,
    nro_medidor TEXT,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE
);

ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Servicios RLS" ON public.servicios FOR ALL USING (auth.uid() = usuario_id);
CREATE INDEX servicios_usuario_id_idx ON public.servicios(usuario_id);

-- FacturaServicio
CREATE TABLE public.factura_servicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    servicio_id UUID NOT NULL REFERENCES public.servicios(id) ON DELETE CASCADE,
    periodo_desde TIMESTAMPTZ NOT NULL,
    periodo_hasta TIMESTAMPTZ NOT NULL,
    fecha_vencimiento TIMESTAMPTZ NOT NULL,
    monto DOUBLE PRECISION NOT NULL,
    estado TEXT NOT NULL,
    fecha_pago TIMESTAMPTZ,
    kw_consumidos DOUBLE PRECISION,
    fecha_emision TIMESTAMPTZ,
    proxima_fecha_vencimiento TIMESTAMPTZ,
    archivo_url TEXT
);

ALTER TABLE public.factura_servicios ENABLE ROW LEVEL SECURITY;
-- RLS para facturas a traves de su servicio
CREATE POLICY "Facturas RLS" ON public.factura_servicios FOR ALL USING (
    EXISTS (SELECT 1 FROM public.servicios WHERE public.servicios.id = factura_servicios.servicio_id AND public.servicios.usuario_id = auth.uid())
);
CREATE INDEX factura_servicios_servicio_id_idx ON public.factura_servicios(servicio_id);

-- Deudas
CREATE TABLE public.deudas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    monto_total DOUBLE PRECISION NOT NULL,
    monto_cuota DOUBLE PRECISION NOT NULL,
    cantidad_cuotas INTEGER NOT NULL,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    tasa_interes DOUBLE PRECISION,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE
);

ALTER TABLE public.deudas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deudas RLS" ON public.deudas FOR ALL USING (auth.uid() = usuario_id);
CREATE INDEX deudas_usuario_id_idx ON public.deudas(usuario_id);

-- Cuotas
CREATE TABLE public.cuotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deuda_id UUID NOT NULL REFERENCES public.deudas(id) ON DELETE CASCADE,
    numero_cuota INTEGER NOT NULL,
    monto DOUBLE PRECISION NOT NULL,
    fecha_vencimiento TIMESTAMPTZ NOT NULL,
    estado TEXT NOT NULL,
    fecha_pago TIMESTAMPTZ
);

ALTER TABLE public.cuotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cuotas RLS" ON public.cuotas FOR ALL USING (
    EXISTS (SELECT 1 FROM public.deudas WHERE public.deudas.id = cuotas.deuda_id AND public.deudas.usuario_id = auth.uid())
);
CREATE INDEX cuotas_deuda_id_idx ON public.cuotas(deuda_id);

-- Vehiculos
CREATE TABLE public.vehiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    anio INTEGER NOT NULL,
    kilometraje_actual INTEGER NOT NULL,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE
);

ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vehiculos RLS" ON public.vehiculos FOR ALL USING (auth.uid() = usuario_id);
CREATE INDEX vehiculos_usuario_id_idx ON public.vehiculos(usuario_id);

-- ComponenteVehiculo
CREATE TABLE public.componente_vehiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehiculo_id UUID NOT NULL REFERENCES public.vehiculos(id) ON DELETE CASCADE,
    tipo_componente TEXT NOT NULL,
    km_vida_util INTEGER NOT NULL,
    km_ultimo_cambio INTEGER NOT NULL,
    fecha_ultimo_cambio TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.componente_vehiculos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Componentes RLS" ON public.componente_vehiculos FOR ALL USING (
    EXISTS (SELECT 1 FROM public.vehiculos WHERE public.vehiculos.id = componente_vehiculos.vehiculo_id AND public.vehiculos.usuario_id = auth.uid())
);
CREATE INDEX componente_vehiculos_vehiculo_id_idx ON public.componente_vehiculos(vehiculo_id);

-- Alertas
CREATE TABLE public.alertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_alerta TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    estado TEXT NOT NULL,
    referencia_id TEXT,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE
);

ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alertas RLS" ON public.alertas FOR ALL USING (auth.uid() = usuario_id);
CREATE INDEX alertas_usuario_id_idx ON public.alertas(usuario_id);

-- RegistroWhatsApp
CREATE TABLE public.registro_whatsapp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audio_url TEXT,
    texto_transcrito TEXT,
    monto_detectado DOUBLE PRECISION,
    categoria_detectada TEXT,
    estado TEXT NOT NULL,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE
);

ALTER TABLE public.registro_whatsapp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "RegistroWhatsApp RLS" ON public.registro_whatsapp FOR ALL USING (auth.uid() = usuario_id);
CREATE INDEX registro_whatsapp_usuario_id_idx ON public.registro_whatsapp(usuario_id);

-- ResumenMensual
CREATE TABLE public.resumen_mensual (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mes INTEGER NOT NULL,
    anio INTEGER NOT NULL,
    total_ingresos DOUBLE PRECISION DEFAULT 0,
    total_egresos DOUBLE PRECISION DEFAULT 0,
    saldo DOUBLE PRECISION DEFAULT 0,
    facturas_pagadas INTEGER DEFAULT 0,
    facturas_vencidas INTEGER DEFAULT 0,
    cuotas_pagadas INTEGER DEFAULT 0,
    cuotas_atrasadas INTEGER DEFAULT 0,
    fecha_generacion TIMESTAMPTZ DEFAULT NOW(),
    estado TEXT NOT NULL,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE
);

ALTER TABLE public.resumen_mensual ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ResumenMensual RLS" ON public.resumen_mensual FOR ALL USING (auth.uid() = usuario_id);
CREATE INDEX resumen_mensual_usuario_id_idx ON public.resumen_mensual(usuario_id);

-- Producto
CREATE TABLE public.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_barra TEXT,
    nombre TEXT NOT NULL,
    marca TEXT,
    categoria TEXT,
    unidad_medida TEXT,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE
);

ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Productos RLS" ON public.productos FOR ALL USING (auth.uid() = usuario_id);
CREATE INDEX productos_usuario_id_idx ON public.productos(usuario_id);

-- Stock
CREATE TABLE public.stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    cantidad DOUBLE PRECISION NOT NULL,
    fecha_ingreso TIMESTAMPTZ DEFAULT NOW(),
    fecha_vencimiento TIMESTAMPTZ,
    estado TEXT NOT NULL,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE
);

ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stocks RLS" ON public.stocks FOR ALL USING (auth.uid() = usuario_id);
CREATE INDEX stocks_producto_id_idx ON public.stocks(producto_id);
CREATE INDEX stocks_usuario_id_idx ON public.stocks(usuario_id);

-- Escaneo
CREATE TABLE public.escaneos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_barra TEXT NOT NULL,
    producto_detectado_id UUID,
    estado TEXT NOT NULL,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE
);

ALTER TABLE public.escaneos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Escaneos RLS" ON public.escaneos FOR ALL USING (auth.uid() = usuario_id);
CREATE INDEX escaneos_usuario_id_idx ON public.escaneos(usuario_id);

-- ListaCompras
CREATE TABLE public.lista_compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    fecha_agregado TIMESTAMPTZ DEFAULT NOW(),
    comprado BOOLEAN DEFAULT false,
    origen TEXT NOT NULL,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE
);

ALTER TABLE public.lista_compras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ListaCompras RLS" ON public.lista_compras FOR ALL USING (auth.uid() = usuario_id);
CREATE INDEX lista_compras_producto_id_idx ON public.lista_compras(producto_id);
CREATE INDEX lista_compras_usuario_id_idx ON public.lista_compras(usuario_id);

-- CategoriaUsuario
CREATE TABLE public.categoria_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE
);

ALTER TABLE public.categoria_usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CategoriaUsuario RLS" ON public.categoria_usuarios FOR ALL USING (auth.uid() = usuario_id);
CREATE INDEX categoria_usuarios_usuario_id_idx ON public.categoria_usuarios(usuario_id);
