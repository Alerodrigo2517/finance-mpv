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
      cantidad: data.cantidad,
      // If we need expiration dates or something else, we could add them here
    };

    const { data: inserted, error } = await supabase
      .from('stock_casa')
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
    return NextResponse.json({ error: error.message || 'Error al guardar stock', details: error }, { status: 500 });
  }
}
