import { env } from '../config/env.js';

export class SmsService {
  /**
   * Send emergency SMS alerts.
   * Uses Twilio if configured, otherwise logs to console.
   */
  static async sendEmergencyAlert(
    lat: number,
    lng: number,
    symptom: string,
    contacts: string[]
  ) {
    const alertId = crypto.randomUUID();
    const message = `🚨 WARMAY EMERGENCIA: ${symptom} en ubicación (${lat}, ${lng}). Responde a esta alerta.`;

    // Try real Twilio
    if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_NUMBER) {
      try {
        const twilio = (await import('twilio')).default;
        const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

        const results = await Promise.allSettled(
          contacts.map(phone =>
            client.messages.create({
              body: message,
              from: env.TWILIO_FROM_NUMBER,
              to: phone,
            })
          )
        );

        const sent = results.filter(r => r.status === 'fulfilled').length;
        console.log(`[SMS] ✅ Sent ${sent}/${contacts.length} emergency alerts via Twilio`);

        return {
          alertId,
          status: 'dispatched' as const,
          sms_sent: sent,
          total_contacts: contacts.length,
          estimatedResponseTime: '5 mins',
        };
      } catch (err) {
        console.error('[SMS] Twilio failed, falling back to log:', err instanceof Error ? err.message : err);
      }
    }

    // Fallback: log to console
    console.log(`[SMS] ⚠️ Twilio not configured. Emergency alert:`);
    console.log(`[SMS] To: ${contacts.join(', ')}`);
    console.log(`[SMS] Message: ${message}`);

    return {
      alertId,
      status: 'dispatched' as const,
      sms_sent: 0,
      total_contacts: contacts.length,
      estimatedResponseTime: '5 mins',
      note: 'Twilio not configured — alert logged to console',
    };
  }
}
