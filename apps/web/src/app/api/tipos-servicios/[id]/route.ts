import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();
    if (!data.nombre || data.nombre.trim() === '') {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const { data: updatedTipo, error } = await supabase
      .from('tipos_servicios')
      .update({ nombre: data.nombre.trim() })
      .eq('id', id)
      .eq('usuario_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updatedTipo);
  } catch (error) {
    console.error('Error in PUT /api/tipos-servicios/[id]:', error);
    return NextResponse.json({ error: 'Error al actualizar tipo de servicio' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { error } = await supabase
      .from('tipos_servicios')
      .delete()
      .eq('id', id)
      .eq('usuario_id', user.id);

    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/tipos-servicios/[id]:', error);
    return NextResponse.json({ error: 'Error al eliminar tipo de servicio' }, { status: 500 });
  }
}
