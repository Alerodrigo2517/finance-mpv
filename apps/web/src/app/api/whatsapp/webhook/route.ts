import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { procesarAudioWhatsApp } from '@/lib/whatsapp';

// Verificación del webhook (Requerido por WhatsApp API)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Reemplazar con variable de entorno real
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'test-token-mvp';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// Recepción de mensajes (Audios)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Extraer ID del usuario (número de teléfono) y URL del audio (simplificado)
    // En WhatsApp Cloud API la estructura es body.entry[0].changes[0].value.messages[0]
    const mensaje = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    
    if (mensaje && mensaje.type === 'audio') {
      const from = mensaje.from;
      const audioId = mensaje.audio.id;
      
      // Buscar usuario por teléfono (simplificado)
      let usuario = await prisma.usuario.findFirst(); // Mock MVP
      
      if (usuario) {
        // 2. Procesar el audio mediante IA (Mockeado por ahora)
        const resultadoIA = await procesarAudioWhatsApp(audioId);
        
        // 3. Crear el registro "Pendiente" o "Procesado" para que el usuario confirme en la web
        await prisma.registroWhatsApp.create({
          data: {
            textoTranscrito: resultadoIA.texto,
            montoDetectado: resultadoIA.monto,
            categoriaDetectada: resultadoIA.categoria,
            estado: 'PROCESADO',
            usuarioId: usuario.id,
          }
        });
      }
    }

    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse('ERROR', { status: 500 });
  }
}
