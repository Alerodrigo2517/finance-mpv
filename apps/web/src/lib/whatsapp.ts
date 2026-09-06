// Mock de procesamiento con IA (OpenAI Whisper + GPT)
// Cuando tengas las claves de API, reemplazarás esta lógica.

export async function procesarAudioWhatsApp(audioId: string) {
  // En la vida real:
  // 1. Descargar audio usando la API de WhatsApp con el audioId
  // 2. Enviar a OpenAI Whisper para transcripción
  // 3. Enviar texto a OpenAI GPT para extraer monto y categoría
  
  console.log(`[IA Mock] Procesando audio ID: ${audioId}`);
  
  // Simulamos un retraso de red y procesamiento
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    texto: "Gasté mil doscientos en el supermercado hoy",
    monto: 1200,
    categoria: "Supermercado"
  };
}
