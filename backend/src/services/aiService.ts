import { env } from '../config/env.js';
import type { ChatResponse } from '../types/index.js';

const RISK_KEYWORDS = [
  'sangrado', 'dolor fuerte', 'sangre', 'hemorragia', 'contracciones fuertes',
  'fiebre alta', 'mareo', 'desmayo', 'hinchazón', 'visión borrosa',
  'dolor de cabeza intenso', 'no siento al bebe', 'liquido',
];

const SYSTEM_PROMPT = `Eres WARMAY IA, una asistente de salud materna especializada en Bolivia.
Respondes en español, quechua o aymara según el idioma del mensaje.
Tu rol es acompañar a mujeres embarazadas, detectar síntomas de riesgo,
y recomendar acciones. Nunca das diagnósticos médicos definitivos.
Si detectas síntomas graves, recomiendas llamar a emergencias inmediatamente.
Responde de forma cálida, empática y breve (máximo 3 párrafos).`;

export class AiService {
  /**
   * Process a chat message. Uses DeepSeek AI if API key is configured,
   * otherwise falls back to keyword-based responses.
   */
  static async chat(
    message: string,
    language: 'es' | 'qu' | 'ay' = 'es',
    context?: { weeks_pregnant?: number; risk_level?: string }
  ): Promise<ChatResponse> {
    const riskDetected = RISK_KEYWORDS.some(kw => message.toLowerCase().includes(kw));

    // Try real DeepSeek API
    if (env.DEEPSEEK_API_KEY) {
      try {
        return await this.callDeepSeek(message, language, riskDetected, context);
      } catch (err) {
        console.error('[AI] DeepSeek API failed, using fallback:', err instanceof Error ? err.message : err);
      }
    }

    // Fallback: keyword-based response
    return this.fallbackResponse(message, language, riskDetected);
  }

  private static async callDeepSeek(
    message: string,
    language: string,
    riskDetected: boolean,
    context?: { weeks_pregnant?: number; risk_level?: string }
  ): Promise<ChatResponse> {
    const contextInfo = context
      ? `\nContexto: ${context.weeks_pregnant} semanas de embarazo, nivel de riesgo: ${context.risk_level}`
      : '';

    const payload = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + contextInfo },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    };

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    const aiMessage = data.choices[0]?.message?.content || 'No pude generar una respuesta.';

    console.log(`[AI] ✅ DeepSeek response (risk: ${riskDetected})`);

    return {
      message: aiMessage,
      language: language as 'es' | 'qu' | 'ay',
      risk_detected: riskDetected,
      recommendations: riskDetected
        ? ['Presiona el botón SOS', 'Contacta a tu médico', 'Ve al hospital más cercano']
        : [],
      escalate: riskDetected,
    };
  }

  private static fallbackResponse(
    message: string,
    language: string,
    riskDetected: boolean
  ): ChatResponse {
    let response: string;

    if (riskDetected) {
      response = language === 'es'
        ? '⚠️ Se ha detectado un síntoma de riesgo. Por favor, presiona el BOTÓN DE PÁNICO inmediatamente y contacta a tu médico.'
        : '⚠️ Riesgo detectado. Presiona el botón de emergencia.';
    } else {
      const lc = message.toLowerCase();
      if (lc.includes('token') || lc.includes('mom')) {
        response = 'Ve a "Controles" y presiona "Reclamar Subsidio" en cualquier control completado para iniciar el proceso con World ID y Chainlink CRE.';
      } else if (lc.includes('control') || lc.includes('cita')) {
        response = 'Recuerda que cada control verificado te da 20 tokens MOM. Asiste a todos tus controles prenatales para mantener tu salud y la de tu bebé.';
      } else if (lc.includes('quechua') || lc.includes('aymara')) {
        response = 'Hablamos los tres idiomas. Puedes escribirme en español, quechua o aymara. Allinllachu!';
      } else {
        response = 'Entiendo tu consulta. Recuerda que siempre puedes llamar a tu médico de cabecera si tienes dudas urgentes. Estoy aquí para acompañarte.';
      }
    }

    return {
      message: response,
      language: language as 'es' | 'qu' | 'ay',
      risk_detected: riskDetected,
      recommendations: riskDetected
        ? ['Presiona el botón SOS', 'Contacta a tu médico', 'Ve al hospital más cercano']
        : [],
      escalate: riskDetected,
    };
  }
}
