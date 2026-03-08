import { Request, Response } from 'express';
import { users } from '../store/index.js';

// For demo, use the first user. In production, derive from auth token.
function getCurrentUserId(): string {
  return users.keys().next().value ?? 'user_demo_001';
}

export class UserController {
  /** GET /user/me */
  static async getMe(_req: Request, res: Response) {
    const user = users.get(getCurrentUserId());
    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: user,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }

  /** PATCH /user/me */
  static async updateMe(req: Request, res: Response) {
    const userId = getCurrentUserId();
    const user = users.get(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
      return;
    }

    const allowed = ['name', 'age', 'weeks_pregnant', 'risk_level'] as const;
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        (user as unknown as Record<string, unknown>)[key] = req.body[key];
      }
    }
    users.set(userId, user);

    res.json({
      success: true,
      data: user,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }

  /** POST /user/location */
  static async updateLocation(req: Request, res: Response) {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'lat and lng are required' },
      });
      return;
    }

    const userId = getCurrentUserId();
    const user = users.get(userId);
    if (user) {
      user.location.lat = lat;
      user.location.lng = lng;
      users.set(userId, user);
    }

    res.json({
      success: true,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }
}
