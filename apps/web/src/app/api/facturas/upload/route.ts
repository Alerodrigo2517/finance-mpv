import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { GoogleGenerativeAI } from '@google/generative-ai';


export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const usuarioId = (session.user as any).id;

    // 1. Get the file from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // 2. Convert file to base64 for Gemini
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Formato no soportado, por favor sube un PDF' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const apiKey = process.env.GEMINI_API_KEY;
    let parsedData: any;

    if (!apiKey || apiKey === "pega_tu_clave_aqui") {
      // Mock data
      parsedData = {
        nombreProveedor: "Edesur (Demo)",
        tipoServicio: "LUZ",
        monto: 14500.50,
        kwConsumidos: 350,
        periodoDesde: "2026-08-01",
        periodoHasta: "2026-08-31",
        fechaEmision: "2026-09-01",
        fechaVencimiento: "2026-09-15",
        proximaFechaVencimiento: "2026-10-15"
      };
      await new Promise(r => setTimeout(r, 2000));
    } else {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      const prompt = `
        Eres un asistente financiero experto. Extrae la siguiente información de esta factura de servicios.
        Devuelve ÚNICAMENTE un objeto JSON válido con las siguientes claves y formatos (si no encuentras un dato, ponlo como null):
        - nombreProveedor: string (ej. Edesur, Metrogas, Claro)
        - tipoServicio: string (debe ser LUZ, GAS, AGUA, INTERNET, o TELEFONIA)
        - monto: number (el total a pagar, solo el número)
        - kwConsumidos: number (si es luz, los kwh o kw totales. Si no hay, null)
        - periodoDesde: string (formato YYYY-MM-DD)
        - periodoHasta: string (formato YYYY-MM-DD)
        - fechaEmision: string (formato YYYY-MM-DD)
        - fechaVencimiento: string (formato YYYY-MM-DD)
        - proximaFechaVencimiento: string (formato YYYY-MM-DD, si existe)
      `;

      // Pass the PDF directly to Gemini
      const pdfPart = {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: "application/pdf"
        }
      };

      const result = await model.generateContent([prompt, pdfPart]);
      const response = await result.response;
      const textResult = response.text();
      
      const jsonStrMatch = textResult.match(/\{[\s\S]*\}/);
      if (!jsonStrMatch) {
        throw new Error('El modelo no devolvió un JSON válido');
      }
      parsedData = JSON.parse(jsonStrMatch[0]);
    }

    // 4. Update Database
    // Buscar o crear servicio
    let servicio = await prisma.servicio.findFirst({
      where: { 
        usuarioId, 
        nombreProveedor: { equals: parsedData.nombreProveedor, mode: 'insensitive' }
      }
    });

    if (!servicio) {
      servicio = await prisma.servicio.create({
        data: {
          tipo: parsedData.tipoServicio || 'OTRO',
          nombreProveedor: parsedData.nombreProveedor || 'Servicio Desconocido',
          usuarioId
        }
      });
    }

    const factura = await prisma.facturaServicio.create({
      data: {
        servicioId: servicio.id,
        periodoDesde: parsedData.periodoDesde ? new Date(parsedData.periodoDesde) : new Date(),
        periodoHasta: parsedData.periodoHasta ? new Date(parsedData.periodoHasta) : new Date(),
        fechaVencimiento: parsedData.fechaVencimiento ? new Date(parsedData.fechaVencimiento) : new Date(),
        monto: parsedData.monto || 0,
        estado: 'PENDIENTE',
        kwConsumidos: parsedData.kwConsumidos,
        fechaEmision: parsedData.fechaEmision ? new Date(parsedData.fechaEmision) : null,
        proximaFechaVencimiento: parsedData.proximaFechaVencimiento ? new Date(parsedData.proximaFechaVencimiento) : null,
      }
    });

    // 5. Create Alerta (5 días antes del vencimiento)
    if (parsedData.fechaVencimiento) {
      const fechaVenc = new Date(parsedData.fechaVencimiento);
      const fechaAlerta = new Date(fechaVenc);
      fechaAlerta.setDate(fechaAlerta.getDate() - 5);
      
      await prisma.alerta.create({
        data: {
          tipoAlerta: 'VENCIMIENTO_FACTURA',
          descripcion: `Tu factura de ${servicio.nombreProveedor} por $${parsedData.monto} vence el ${fechaVenc.toLocaleDateString()}`,
          fecha: fechaAlerta,
          estado: 'NO_LEIDA',
          referenciaId: factura.id,
          usuarioId
        }
      });
    }

    return NextResponse.json({ success: true, factura, parsedData });
  } catch (error: any) {
    console.error('Error procesando factura:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
