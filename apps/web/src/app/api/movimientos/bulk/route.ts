import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const data = await request.json();
    const ids = data.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron IDs válidos' }, { status: 400 });
    }

    const { error } = await supabase
      .from('movimientos')
      .delete()
      .in('id', ids)
      .eq('usuario_id', user.id); // Ensure user only deletes their own movements

    if (error) throw error;

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al eliminar movimientos en lote' }, { status: 500 });
  }
}
