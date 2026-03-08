import { Request, Response } from 'express';
import { trustContacts, users } from '../store/index.js';

function getCurrentUserId(): string {
  return users.keys().next().value ?? 'user_demo_001';
}

export class TrustNetworkController {
  /** GET /trust-network */
  static async getAll(_req: Request, res: Response) {
    const userId = getCurrentUserId();
    const contacts = Array.from(trustContacts.values()).filter(
      c => c.maternal_id === userId
    );

    res.json({
      success: true,
      data: contacts,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }

  /** POST /trust-network */
  static async add(req: Request, res: Response) {
    const { name, phone, relationship, can_receive_alerts } = req.body;

    if (!name || !phone || !relationship) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'name, phone, and relationship are required' },
      });
      return;
    }

    const contact = {
      id: crypto.randomUUID(),
      maternal_id: getCurrentUserId(),
      name,
      phone,
      relationship,
      is_verified: false,
      can_receive_alerts: can_receive_alerts ?? true,
    };
    trustContacts.set(contact.id, contact);

    res.status(201).json({
      success: true,
      data: contact,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }

  /** DELETE /trust-network/:id */
  static async remove(req: Request, res: Response) {
    const id = req.params.id as string;

    if (!trustContacts.has(id)) {
      res.status(404).json({
        success: false,
        error: { code: 'CONTACT_NOT_FOUND', message: 'Trust contact not found' },
      });
      return;
    }

    trustContacts.delete(id);

    res.json({
      success: true,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }
}
