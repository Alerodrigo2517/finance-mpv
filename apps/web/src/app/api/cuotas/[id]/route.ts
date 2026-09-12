import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();
    const resolvedParams = await params;
    const cuotaId = resolvedParams.id;

    // TODO: Verify if the cuota belongs to a deuda owned by the user

    const { data: cuotaActualizada, error } = await supabase
      .from('cuotas')
      .update({
        estado: data.estado,
        fecha_pago: data.estado === 'PAGADA' ? new Date().toISOString() : null,
      })
      .eq('id', cuotaId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(cuotaActualizada);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar cuota' }, { status: 500 });
  }
}
