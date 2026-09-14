import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    // Fetch products along with their stock, shopping list status, and prices
    const { data: productos, error } = await supabase
      .from('productos')
      .select(`
        *, 
        stock_casa(*), 
        lista_compras(*), 
        precios_supermercados(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(productos);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    // Upsert the product
    const { data: producto, error } = await supabase
      .from('productos')
      .upsert({
        id: data.id, // Will insert new if null, update if exists
        usuario_id: user.id,
        nombre: data.nombre,
        categoria: data.categoria || null,
        codigo_barra: data.codigo_barra || null,
        imagen_url: data.imagen_url || null,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(producto, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}
