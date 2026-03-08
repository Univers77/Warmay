import { Request, Response } from 'express';
import { WorldIdService } from '../services/worldIdService.js';

export class WorldIdController {
  /**
   * POST /auth/world-id/verify
   * Verify a World ID ZK proof server-side.
   */
  static async verify(req: Request, res: Response) {
    const { proof, action, signal } = req.body;

    if (!proof || !action) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'proof and action are required' },
      });
      return;
    }

    const result = await WorldIdService.verifyProof(proof, action, signal);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: { code: result.error, message: result.detail },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        success: true,
        nullifier_hash: result.nullifier_hash,
        action: result.action,
        created_at: result.created_at,
      },
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }

  /**
   * GET /auth/world-id/status/:hash
   * Check if a nullifier hash has been verified.
   */
  static async status(req: Request, res: Response) {
    const hash = req.params.hash as string;

    if (!hash) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_HASH', message: 'nullifier hash is required' },
      });
      return;
    }

    const verified = WorldIdService.isVerified(hash);

    res.json({
      success: true,
      data: { verified },
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }
}
