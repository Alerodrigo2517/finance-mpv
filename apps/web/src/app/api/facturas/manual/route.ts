import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const formSchema = z.object({
  servicioId: z.string().uuid("El servicioId debe ser un UUID válido"),
  monto: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "El monto debe ser un número positivo"),
  fechaVencimiento: z.string().min(1, "La fecha de vencimiento es obligatoria"),
  periodoDesde: z.string().optional().nullable(),
  periodoHasta: z.string().optional().nullable(),
  kwConsumidos: z.string().optional().nullable().refine((val) => !val || !isNaN(parseFloat(val)), "El consumo debe ser un número válido"),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const usuarioId = user.id;

    const formData = await request.formData();
    
    // Parse form data into a simple object for Zod validation
    const formDataObj = {
      servicioId: formData.get('servicioId') as string,
      monto: formData.get('monto') as string,
      fechaVencimiento: formData.get('fechaVencimiento') as string,
      periodoDesde: formData.get('periodoDesde') as string | null,
      periodoHasta: formData.get('periodoHasta') as string | null,
      kwConsumidos: formData.get('kwConsumidos') as string | null,
    };

    const validationResult = formSchema.safeParse(formDataObj);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((e: any) => e.message).join(', ');
      return NextResponse.json({ error: `Error de validación: ${errorMsg}` }, { status: 400 });
    }

    const { servicioId, monto, fechaVencimiento, periodoDesde, periodoHasta, kwConsumidos } = validationResult.data;
    const file = formData.get('file') as File | null;

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
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1] || 'pdf';
      const fileName = `factura_manual_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('facturas')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Error subiendo factura manual a storage:', uploadError);
        throw new Error(`Error en storage: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('facturas')
        .getPublicUrl(fileName);

      archivoUrl = publicUrlData.publicUrl;
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
