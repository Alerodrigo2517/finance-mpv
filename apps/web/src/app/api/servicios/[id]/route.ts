import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const resolvedParams = await params;
    const servicioId = resolvedParams.id;

    const { data: servicio } = await supabase
      .from('servicios')
      .select('usuario_id')
      .eq('id', servicioId)
      .single();

    if (!servicio || servicio.usuario_id !== user.id) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
    }

    const { error } = await supabase
      .from('servicios')
      .delete()
      .eq('id', servicioId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Error al eliminar servicio' }, { status: 500 });
  }
}
