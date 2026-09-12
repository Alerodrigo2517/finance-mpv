import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(
  request: Request,
  { params }: any
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const usuarioId = user.id;

    const categoriaId = params.id;

    const { data: categoria } = await supabase
      .from('categoria_usuarios')
      .select('usuario_id')
      .eq('id', categoriaId)
      .single();

    if (!categoria || categoria.usuario_id !== usuarioId) {
      return NextResponse.json({ error: 'No autorizado o no encontrada' }, { status: 403 });
    }

    await supabase
      .from('categoria_usuarios')
      .delete()
      .eq('id', categoriaId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting categoria:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: any
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const usuarioId = user.id;
    const categoriaId = params.id;

    const body = await request.json();
    const { nombre } = body;

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const { data: categoria } = await supabase
      .from('categoria_usuarios')
      .select('usuario_id')
      .eq('id', categoriaId)
      .single();

    if (!categoria || categoria.usuario_id !== usuarioId) {
      return NextResponse.json({ error: 'No autorizado o no encontrada' }, { status: 403 });
    }

    const { data: categoriaActualizada, error } = await supabase
      .from('categoria_usuarios')
      .update({ nombre })
      .eq('id', categoriaId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(categoriaActualizada);
  } catch (error) {
    console.error('Error updating categoria:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
