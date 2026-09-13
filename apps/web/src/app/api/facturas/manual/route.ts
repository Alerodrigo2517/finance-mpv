import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const usuarioId = user.id;

    const formData = await request.formData();
    const servicioId = formData.get('servicioId') as string;
    const monto = formData.get('monto') as string;
    const fechaVencimiento = formData.get('fechaVencimiento') as string;
    const periodoDesde = formData.get('periodoDesde') as string;
    const periodoHasta = formData.get('periodoHasta') as string;
    const kwConsumidos = formData.get('kwConsumidos') as string;
    const file = formData.get('file') as File | null;

    if (!servicioId || !monto || !fechaVencimiento) {
      return NextResponse.json({ error: 'Faltan datos obligatorios (servicioId, monto, fechaVencimiento)' }, { status: 400 });
    }

    const { data: servicio } = await supabase
      .from('servicios')
      .select('id, nombre_proveedor, usuario_id')
      .eq('id', servicioId)
      .eq('usuario_id', usuarioId)
      .single();

    if (!servicio) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
    }

    let archivoUrl = null;
    if (file) {
      const { writeFile, mkdir } = await import('fs/promises');
      const path = await import('path');
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadsDir = path.default.join(process.cwd(), 'public', 'uploads', 'facturas');
      await mkdir(uploadsDir, { recursive: true });
      const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1] || 'pdf';
      const fileName = `factura_manual_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = path.default.join(uploadsDir, fileName);
      await writeFile(filePath, buffer);
      archivoUrl = `/uploads/facturas/${fileName}`;
    }

    const { data: factura, error: facturaError } = await supabase
      .from('factura_servicios')
      .insert({
        servicio_id: servicioId,
        monto: parseFloat(monto),
        fecha_vencimiento: fechaVencimiento.includes('T') ? new Date(fechaVencimiento).toISOString() : new Date(`${fechaVencimiento}T12:00:00Z`).toISOString(),
        periodo_desde: periodoDesde 
          ? (periodoDesde.includes('T') ? new Date(periodoDesde).toISOString() : new Date(`${periodoDesde}T12:00:00Z`).toISOString()) 
          : new Date().toISOString(),
        periodo_hasta: periodoHasta 
          ? (periodoHasta.includes('T') ? new Date(periodoHasta).toISOString() : new Date(`${periodoHasta}T12:00:00Z`).toISOString()) 
          : new Date().toISOString(),
        kw_consumidos: kwConsumidos ? parseFloat(kwConsumidos) : null,
        estado: 'PENDIENTE',
        archivo_url: archivoUrl,
      })
      .select()
      .single();
      
    if (facturaError) throw facturaError;

    // Create Alerta (5 días antes del vencimiento)
    const fechaVenc = new Date(factura.fecha_vencimiento);
    const fechaAlerta = new Date(fechaVenc);
    fechaAlerta.setDate(fechaAlerta.getDate() - 5);
    
    await supabase.from('alertas').insert({
      tipo_alerta: 'VENCIMIENTO_FACTURA',
      descripcion: `Tu factura de ${servicio.nombre_proveedor} por $${monto} vence el ${fechaVenc.toLocaleDateString()}`,
      fecha: fechaAlerta.toISOString(),
      estado: 'NO_LEIDA',
      referencia_id: factura.id,
      usuario_id: usuarioId
    });

    return NextResponse.json({ success: true, factura });
  } catch (error: unknown) {
    console.error('Error creando factura manual:', error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Error interno' }, { status: 500 });
  }
}
