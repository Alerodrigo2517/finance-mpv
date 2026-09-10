import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';


export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const usuarioId = session.user.id;

    // 1. Get the file from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // 2. Convert file to base64 for Gemini
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Formato no soportado, por favor sube un PDF o una imagen (JPG/PNG)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const apiKey = process.env.GEMINI_API_KEY;
    let parsedData: Record<string, unknown> | null = null;

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
      const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const prompt = `
        Eres un asistente financiero experto. Extrae la siguiente información de esta factura de servicios.
        Debes devolver el resultado usando el siguiente esquema JSON (si no encuentras un dato o no aplica, usa null):
        {
          "nombreProveedor": "string (ej. Edesur, Metrogas, Claro)",
          "tipoServicio": "string (debe ser estricto: LUZ, GAS, AGUA, INTERNET, o TELEFONIA)",
          "monto": "number (el monto total a pagar)",
          "fechaVencimiento": "string (formato YYYY-MM-DD)",
          "periodoDesde": "string (formato YYYY-MM-DD) (si existe)",
          "periodoHasta": "string (formato YYYY-MM-DD) (si existe)",
          "kwConsumidos": "number (si es luz, los kWh consumidos, sino null)",
          "fechaEmision": "string (formato YYYY-MM-DD) (si existe)",
          "proximaFechaVencimiento": "string (formato YYYY-MM-DD) (si existe)",
          "nroCuenta": "string (el número de cuenta, cliente, NIS o referencia de pago, ej. '05-5102', sino null)",
          "nroMedidor": "string (el número de medidor si aplica, ej. '163123', sino null)"
        }
      `;

      // Pass the file directly to Gemini
      const filePart = {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: file.type
        }
      };

      const result = await model.generateContent([prompt, filePart]);
      const textResult = result.response.text();
      
      try {
        parsedData = JSON.parse(textResult);
      } catch (e) {
        throw new Error('El modelo no devolvió un JSON válido: ' + textResult);
      }
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

    // Guardar archivo físicamente
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'facturas');
    await mkdir(uploadsDir, { recursive: true });
    
    // Extraer extensión del file.type o usar .pdf por defecto
    const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1] || 'pdf';
    const fileName = `factura_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);
    const archivoUrl = `/uploads/facturas/${fileName}`;

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
        archivoUrl: archivoUrl
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
  } catch (error: unknown) {
    console.error('Error procesando factura:', error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) || 'Error interno' }, { status: 500 });
  }
}
