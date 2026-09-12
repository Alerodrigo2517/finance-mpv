import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const { data: productos, error } = await supabase
      .from('productos')
      .select('*, stocks(*)')
      .eq('usuario_id', user.id);

    if (error) throw error;
    return NextResponse.json(productos);
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    const { data: producto, error: prodError } = await supabase
      .from('productos')
      .insert({
        nombre: data.nombre,
        codigo_barra: data.codigoBarras,
        categoria: data.categoria || 'General',
        usuario_id: user.id,
      })
      .select()
      .single();

    if (prodError) throw prodError;

    if (producto) {
      const { error: stockError } = await supabase
        .from('stocks')
        .insert({
          producto_id: producto.id,
          cantidad: parseFloat(data.cantidad || '1'),
          estado: 'DISPONIBLE',
          usuario_id: user.id,
        });
      
      if (stockError) throw stockError;
    }

    const { data: fullProduct, error: fetchError } = await supabase
      .from('productos')
      .select('*, stocks(*)')
      .eq('id', producto.id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(fullProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
