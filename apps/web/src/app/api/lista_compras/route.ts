import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    const payload = {
      usuario_id: user.id,
      producto_id: data.producto_id,
      origen: 'manual'
    };

    const { data: inserted, error } = await supabase
      .from('lista_compras')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("DB Error:", error);
      throw error;
    }
    return NextResponse.json(inserted, { status: 201 });
  } catch (error: any) {
    console.error("Catch Error:", error);
    return NextResponse.json({ error: error.message || 'Error al agregar a la lista', details: error }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Falta el ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('lista_compras')
      .delete()
      .eq('id', id)
      .eq('usuario_id', user.id);

    if (error) {
      console.error("DELETE DB Error:", error);
      throw error;
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE Catch Error:", error);
    return NextResponse.json({ error: 'Error al eliminar de la lista' }, { status: 500 });
  }
}
