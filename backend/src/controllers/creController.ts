import { Request, Response } from 'express';
import { CreService } from '../services/creService.js';

export class CreController {
  /** POST /cre/trigger */
  static async trigger(req: Request, res: Response) {
    const { workflow_id, payload } = req.body;

    if (!payload) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PAYLOAD', message: 'payload is required' },
      });
      return;
    }

    const result = await CreService.triggerWorkflow({
      workflow_id,
      ...payload,
    });

    res.json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }

  /** GET /cre/status/:id */
  static async status(req: Request, res: Response) {
    const id = req.params.id as string;

    const result = CreService.getExecutionStatus(id);
    if (!result) {
      res.status(404).json({
        success: false,
        error: { code: 'EXECUTION_NOT_FOUND', message: 'CRE execution not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }
}
