import { Request, Response } from 'express';
import { controls } from '../store/index.js';
import { CreService } from '../services/creService.js';

export class ControlsController {
  /** GET /controls */
  static async getAll(_req: Request, res: Response) {
    const all = Array.from(controls.values());

    res.json({
      success: true,
      data: all,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }

  /** GET /controls/:id */
  static async getById(req: Request, res: Response) {
    const control = controls.get(req.params.id as string);
    if (!control) {
      res.status(404).json({
        success: false,
        error: { code: 'CONTROL_NOT_FOUND', message: 'Prenatal control not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: control,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }

  /** POST /controls/:id/verify — verifies a control via CRE workflow */
  static async verify(req: Request, res: Response) {
    const control = controls.get(req.params.id as string);
    if (!control) {
      res.status(404).json({
        success: false,
        error: { code: 'CONTROL_NOT_FOUND', message: 'Prenatal control not found' },
      });
      return;
    }

    if (control.status === 'verificado_blockchain') {
      res.status(409).json({
        success: false,
        error: { code: 'ALREADY_VERIFIED', message: 'Control already verified on blockchain' },
      });
      return;
    }

    const result = await CreService.triggerWorkflow({
      type: 'control_verification',
      control_id: control.id,
      maternal_id: control.maternal_id,
      control_type: control.type,
      week_number: control.week_number,
    });

    // If CRE returned a tx_hash, update the control status
    if (result.status === 'success' && result.tx_hash) {
      control.status = 'verificado_blockchain';
      control.blockchain_tx = result.tx_hash;
      control.verified_at = new Date().toISOString();
      controls.set(control.id, control);
    }

    res.json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }
}
