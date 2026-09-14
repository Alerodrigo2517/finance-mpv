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

    if (error) {
      console.error("GET DB Error:", error);
      throw error;
    }
    return NextResponse.json(productos);
  } catch (error: any) {
    console.error("GET Catch Error:", error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();

    // Build payload
    const payload: any = {
      usuario_id: user.id,
      nombre: data.nombre,
      categoria: data.categoria || null,
      codigo_barra: data.codigo_barra || null,
      imagen_url: data.imagen_url || null,
    };

    let query = supabase.from('productos');
    let dbResult;

    if (data.id) {
      dbResult = await query.update(payload).eq('id', data.id).select().single();
    } else {
      dbResult = await query.insert(payload).select().single();
    }

    const { data: producto, error } = dbResult;

    if (error) {
      console.error("DB Error:", error);
      throw error;
    }
    return NextResponse.json(producto, { status: 201 });
  } catch (error: any) {
    console.error("Catch Error:", error);
    return NextResponse.json({ error: error.message || 'Error al crear producto', details: error }, { status: 500 });
  }
}
