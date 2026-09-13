import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const resolvedParams = await params;
    const facturaId = resolvedParams.id;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const metodoPago = formData.get('metodoPago') as string | null;

    // Verificar si la factura existe y pertenece al usuario
    const { data: factura, error: checkError } = await supabase
      .from('factura_servicios')
      .select('*, servicios(usuario_id)')
      .eq('id', facturaId)
      .single();

    if (checkError || !factura || factura.servicios?.usuario_id !== user.id) {
      return NextResponse.json({ error: 'Factura no encontrada o sin permisos' }, { status: 404 });
    }

    let comprobanteUrl = factura.comprobante_url;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      
      const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1] || 'pdf';
      const fileName = `comprobante_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('facturas')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Error subiendo comprobante a storage:', uploadError);
        throw new Error(`Error en storage: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('facturas')
        .getPublicUrl(fileName);

      comprobanteUrl = publicUrlData.publicUrl;
    }

    // Actualizar factura a PAGADA y guardar el archivo y detalles de pago si existen
    const { data: updatedFactura, error: updateError } = await supabase
      .from('factura_servicios')
      .update({
        estado: 'PAGADA',
        fecha_pago: new Date().toISOString(),
        ...(metodoPago ? { metodo_pago: metodoPago } : {}),
        ...(file ? { comprobante_url: comprobanteUrl } : {})
      })
      .eq('id', facturaId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, factura: updatedFactura });
  } catch (error: unknown) {
    console.error('Error subiendo comprobante:', error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Error interno' }, { status: 500 });
  }
}
