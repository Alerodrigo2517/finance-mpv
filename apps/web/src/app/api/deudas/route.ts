import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const { data: deudas, error } = await supabase
      .from('deudas')
      .select('*, cuotas(*)')
      .eq('usuario_id', user.id);

    if (error) throw error;
    return NextResponse.json(deudas);
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

    const montoTotal = parseFloat(data.montoTotal);
    const cantidadCuotas = parseInt(data.cantidadCuotas) || 1;
    const montoCuota = montoTotal / cantidadCuotas;
    const fechaInicio = new Date(data.fechaInicio);

    const { data: nuevaDeuda, error: deudaError } = await supabase
      .from('deudas')
      .insert({
        nombre: data.entidad || 'Deuda',
        monto_total: montoTotal,
        monto_cuota: montoCuota,
        cantidad_cuotas: cantidadCuotas,
        fecha_inicio: fechaInicio.toISOString(),
        usuario_id: user.id,
      })
      .select()
      .single();

    if (deudaError) throw deudaError;

    if (nuevaDeuda) {
      const cuotasArray = [];
      for (let i = 0; i < cantidadCuotas; i++) {
        const fechaVencimiento = new Date(fechaInicio);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);
        
        cuotasArray.push({
          deuda_id: nuevaDeuda.id,
          numero_cuota: i + 1,
          monto: montoCuota,
          fecha_vencimiento: fechaVencimiento.toISOString(),
          estado: 'PENDIENTE'
        });
      }

      const { error: cuotasError } = await supabase
        .from('cuotas')
        .insert(cuotasArray);

      if (cuotasError) throw cuotasError;
    }

    return NextResponse.json(nuevaDeuda, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear deuda' }, { status: 500 });
  }
}
