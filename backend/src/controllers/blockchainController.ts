import { Request, Response } from 'express';
import { BlockchainService } from '../services/blockchainService.js';
import { transactions } from '../store/index.js';

export class BlockchainController {
  /** GET /blockchain/transactions */
  static async getTransactions(_req: Request, res: Response) {
    res.json({
      success: true,
      data: transactions,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }

  /** GET /blockchain/verify/:txHash */
  static async verifyTx(req: Request, res: Response) {
    const txHash = req.params.txHash as string;

    if (!txHash) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_TX_HASH', message: 'Transaction hash is required' },
      });
      return;
    }

    if (!BlockchainService.isConfigured()) {
      res.json({
        success: true,
        data: { confirmed: false, note: 'Blockchain not configured' },
        meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
      });
      return;
    }

    const result = await BlockchainService.verifyTransaction(txHash);

    res.json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }
}
