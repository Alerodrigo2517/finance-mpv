import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const resolvedParams = await params;
    const movId = resolvedParams.id;

    const { data: mov } = await supabase.from('movimientos').select('*').eq('id', movId).single();
    if (!mov || mov.usuario_id !== user.id) {
       return NextResponse.json({ error: 'No autorizado o no encontrado' }, { status: 403 });
    }

    const data = await request.json();
    const { tipo, monto, categoria, descripcion, fecha } = data;

    const updateData: any = { tipo, categoria, descripcion };
    if (monto !== undefined) updateData.monto = parseFloat(monto);
    if (fecha) updateData.fecha = new Date(fecha).toISOString();

    const { data: actualizado, error } = await supabase
      .from('movimientos')
      .update(updateData)
      .eq('id', movId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(actualizado);
  } catch (error) {
    console.error('Error al actualizar movimiento:', error);
    return NextResponse.json({ error: 'Error al actualizar movimiento' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const resolvedParams = await params;
    const movId = resolvedParams.id;

    const { data: mov } = await supabase.from('movimientos').select('*').eq('id', movId).single();
    if (!mov || mov.usuario_id !== user.id) {
       return NextResponse.json({ error: 'No autorizado o no encontrado' }, { status: 403 });
    }

    await supabase.from('movimientos').delete().eq('id', movId);

    return NextResponse.json({ message: 'Movimiento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar movimiento:', error);
    return NextResponse.json({ error: 'Error al eliminar movimiento' }, { status: 500 });
  }
}
