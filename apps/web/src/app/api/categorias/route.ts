import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const usuarioId = user.id;

    let { data: categorias, error: fetchError } = await supabase
      .from('categoria_usuarios')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('nombre', { ascending: true });

    if (fetchError) throw fetchError;

    // Seed defaults if user has no categories
    if (!categorias || categorias.length === 0) {
      const defaultCategories = [
        { nombre: 'Supermercado', tipo: 'EGRESO', usuario_id: usuarioId },
        { nombre: 'Servicios', tipo: 'EGRESO', usuario_id: usuarioId },
        { nombre: 'Transporte', tipo: 'EGRESO', usuario_id: usuarioId },
        { nombre: 'Entretenimiento', tipo: 'EGRESO', usuario_id: usuarioId },
        { nombre: 'Sueldo', tipo: 'INGRESO', usuario_id: usuarioId },
        { nombre: 'Transferencias', tipo: 'INGRESO', usuario_id: usuarioId },
      ];
      
      const { error: insertError } = await supabase
        .from('categoria_usuarios')
        .insert(defaultCategories);

      if (insertError) throw insertError;
      
      const { data: nuevasCategorias } = await supabase
        .from('categoria_usuarios')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('nombre', { ascending: true });

      categorias = nuevasCategorias || [];
    }

    return NextResponse.json(categorias);
  } catch (error) {
    console.error('Error fetching categorias:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const usuarioId = user.id;

    const body = await request.json();
    const { nombre, tipo } = body;

    if (!nombre || !tipo) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
    }

    const { data: nuevaCategoria, error } = await supabase
      .from('categoria_usuarios')
      .insert({
        nombre,
        tipo,
        usuario_id: usuarioId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(nuevaCategoria);
  } catch (error) {
    console.error('Error creating categoria:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
