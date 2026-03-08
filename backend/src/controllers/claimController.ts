import { Request, Response } from 'express';
import { WorldIdService } from '../services/worldIdService.js';
import { CreService } from '../services/creService.js';

export class ClaimController {
  /** POST /worldid/rp-signature */
  static async generateSignature(_req: Request, res: Response) {
    const signature = await WorldIdService.generateRpSignature();
    res.json(signature);
  }

  /** POST /claim — triggers the full CRE claim flow */
  static async startClaim(req: Request, res: Response) {
    const { beneficiary, idkitResponse } = req.body;

    if (!beneficiary || !idkitResponse) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'beneficiary and idkitResponse are required' },
      });
      return;
    }

    const result = await CreService.triggerClaimFlow(beneficiary, idkitResponse);

    res.json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }
}
