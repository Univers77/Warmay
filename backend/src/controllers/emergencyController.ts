import { Request, Response } from 'express';
import { SmsService } from '../services/smsService.js';
import { emergencies, trustContacts, users } from '../store/index.js';
import type { EmergencyAlert, Hospital } from '../types/index.js';

// Static hospital data for Bolivia (replace with real API in production)
const HOSPITALS: Hospital[] = [
  {
    id: 'hosp_001',
    name: 'Hospital de la Mujer',
    distance_km: 2.5,
    estimated_time_min: 8,
    has_ambulance: true,
    specialty: ['obstetricia', 'neonatología', 'emergencias'],
    phone: '+59122456789',
    status: 'disponible',
  },
  {
    id: 'hosp_002',
    name: 'Hospital del Niño',
    distance_km: 4.1,
    estimated_time_min: 15,
    has_ambulance: true,
    specialty: ['pediatría', 'neonatología'],
    phone: '+59122567890',
    status: 'disponible',
  },
  {
    id: 'hosp_003',
    name: 'Centro de Salud San Pedro',
    distance_km: 1.2,
    estimated_time_min: 5,
    has_ambulance: false,
    specialty: ['medicina general', 'control prenatal'],
    phone: '+59122345678',
    status: 'disponible',
  },
];

function getCurrentUserId(): string {
  return users.keys().next().value ?? 'user_demo_001';
}

export class EmergencyController {
  /** POST /emergency (legacy) */
  static async handleEmergency(req: Request, res: Response) {
    const { lat, lng, symptom, contacts } = req.body;

    if (!lat || !lng || !symptom || !contacts) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'lat, lng, symptom, and contacts are required' },
      });
      return;
    }

    const result = await SmsService.sendEmergencyAlert(lat, lng, symptom, contacts);
    res.json({ success: true, data: result });
  }

  /** POST /emergency/trigger */
  static async trigger(req: Request, res: Response) {
    const { type, location } = req.body;

    if (!type || !location?.lat || !location?.lng) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'type and location (lat, lng) are required' },
      });
      return;
    }

    const userId = getCurrentUserId();

    // Get trust contacts for SMS notification
    const contacts = Array.from(trustContacts.values())
      .filter(c => c.maternal_id === userId && c.can_receive_alerts)
      .map(c => c.phone);

    // Send SMS
    await SmsService.sendEmergencyAlert(location.lat, location.lng, type, contacts);

    const alert: EmergencyAlert = {
      id: crypto.randomUUID(),
      maternal_id: userId,
      type,
      location: { lat: location.lat, lng: location.lng, accuracy: location.accuracy || 10 },
      status: 'activa',
      nearest_hospitals: HOSPITALS.slice(0, 3),
      trust_network_notified: contacts.length > 0,
      ambulance_dispatched: true,
      created_at: new Date().toISOString(),
    };
    emergencies.set(alert.id, alert);

    res.json({
      success: true,
      data: alert,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }

  /** GET /emergency/active */
  static async getActive(_req: Request, res: Response) {
    const userId = getCurrentUserId();
    const active = Array.from(emergencies.values()).find(
      e => e.maternal_id === userId && e.status === 'activa'
    );

    res.json({
      success: true,
      data: active || null,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }

  /** POST /emergency/:id/cancel */
  static async cancel(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const alert = emergencies.get(id);

    if (!alert) {
      res.status(404).json({
        success: false,
        error: { code: 'EMERGENCY_NOT_FOUND', message: 'Emergency alert not found' },
      });
      return;
    }

    alert.status = 'cancelada';
    alert.resolved_at = new Date().toISOString();
    emergencies.set(id, alert);

    res.json({
      success: true,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }

  /** GET /emergency/hospitals */
  static async getNearestHospitals(req: Request, res: Response) {
    // In production, filter/sort by actual lat/lng proximity
    res.json({
      success: true,
      data: HOSPITALS,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }
}
