import { Request, Response } from 'express';
import { tokenClaims, users } from '../store/index.js';
import { BlockchainService } from '../services/blockchainService.js';

export class TokensController {
  /** GET /tokens/balance */
  static async getBalance(req: Request, res: Response) {
    const address = req.query.address as string;

    // If blockchain is configured and address provided, get real balance
    if (address && BlockchainService.isConfigured()) {
      const { balance } = await BlockchainService.getTokenBalance(address);
      const claims = Array.from(tokenClaims.values());
      const pendingClaims = claims.filter(c => c.status === 'pending').length;
      const totalEarned = claims
        .filter(c => c.status === 'confirmed')
        .reduce((sum, c) => sum + c.amount, 0);

      res.json({
        success: true,
        data: {
          address,
          balance: parseFloat(balance),
          pending_claims: pendingClaims,
          total_earned: totalEarned,
          last_claim_at: claims.length > 0 ? claims[claims.length - 1].created_at : undefined,
        },
        meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
      });
      return;
    }

    // Fallback: in-memory calculation
    const claims = Array.from(tokenClaims.values());
    const totalEarned = claims
      .filter(c => c.status === 'confirmed')
      .reduce((sum, c) => sum + c.amount, 0);

    res.json({
      success: true,
      data: {
        address: address || '0x0000...demo',
        balance: totalEarned,
        pending_claims: claims.filter(c => c.status === 'pending').length,
        total_earned: totalEarned,
        last_claim_at: claims.length > 0 ? claims[claims.length - 1].created_at : undefined,
      },
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }

  /** POST /tokens/claim */
  static async claim(req: Request, res: Response) {
    const { beneficiary, nullifier_hash, control_type } = req.body;

    // If blockchain is configured, execute real claim
    if (BlockchainService.isConfigured() && beneficiary && nullifier_hash) {
      const result = await BlockchainService.executeClaim(
        beneficiary,
        nullifier_hash,
        control_type || 'PRENATAL'
      );

      if ('error' in result) {
        res.status(500).json({
          success: false,
          error: { code: 'CLAIM_FAILED', message: result.error },
        });
        return;
      }

      const claim = {
        id: crypto.randomUUID(),
        maternal_id: users.keys().next().value ?? 'unknown',
        amount: control_type === 'PARTO' ? 50 : control_type === 'POSTPARTO' ? 30 : 20,
        reason: 'control_prenatal' as const,
        blockchain_tx: result.tx_hash,
        status: 'confirmed' as const,
        created_at: new Date().toISOString(),
      };
      tokenClaims.set(claim.id, claim);

      res.json({
        success: true,
        data: claim,
        meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
      });
      return;
    }

    // Fallback: create in-memory claim
    const claim = {
      id: crypto.randomUUID(),
      maternal_id: users.keys().next().value ?? 'unknown',
      amount: 20,
      reason: 'control_prenatal' as const,
      blockchain_tx: `0x${crypto.randomUUID().replace(/-/g, '')}`,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    };
    tokenClaims.set(claim.id, claim);

    res.json({
      success: true,
      data: claim,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }

  /** GET /tokens/history */
  static async history(_req: Request, res: Response) {
    const claims = Array.from(tokenClaims.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    res.json({
      success: true,
      data: claims,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }
}
