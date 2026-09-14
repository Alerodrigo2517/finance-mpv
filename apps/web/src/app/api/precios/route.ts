import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    const { data: precio, error } = await supabase
      .from('precios_supermercados')
      .insert({
        producto_id: data.producto_id,
        supermercado: data.supermercado,
        precio: parseFloat(data.precio),
        fecha: data.fecha || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(precio, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar precio' }, { status: 500 });
  }
}
