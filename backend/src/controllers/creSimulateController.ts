import { Request, Response } from 'express';

// Definición básica de Payload
interface SimPayload {
  execution_id: string;
  beneficiary: string;
  rp_id: string;
  idkitResponse: {
    nullifierHash: string;
    [key: string]: any;
  };
}

export class CRESimulateController {
  /**
   * MOCK DEL ORÀCULO CHAINLINK CRE (Para la fase de Hackathon)
   * Ruta: POST /api/cre/simulate-webhook
   */
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    const payload = req.body as SimPayload;
    
    console.log("-----------------------------------------");
    console.log("🧠 [CRE MOCK] Webhook received in Local Backend!");
    console.log(`🧠 [CRE MOCK] Processing payload for: ${payload.beneficiary}`);

    // Simulación del Oráculo: Retraso artificial de 2 segundos para representar consenso de red
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Validar datos básicos
    if (!payload.beneficiary || !payload.idkitResponse || !payload.idkitResponse.nullifierHash) {
      res.status(400).json({ error: "Missing beneficiary or missing World ID nullifier hash" });
      return;
    }

    // Respuesta Simulada Positiva equivalente a la salida de Tu Workflow de typescript
    const mockSuccessResponse = {
      execution_id: payload.execution_id,
      status: "completed",
      consensus_reached: true,
      nodes_participated: 4,
      tx_hash: "0x123...simulated...abc", // En una arquitectura CRE real, la DON envía el Tx y retorna el hash 
      result: {
        success: true,
        action: "CLAIM_SUBSIDY",
        beneficiary: payload.beneficiary,
        nullifierHash: payload.idkitResponse.nullifierHash,
        subsidyType: "PRENATAL",
        metadata: {
          aiVerified: true,
          worldIdVerified: true,
          timestamp: new Date().toISOString()
        }
      }
    };

    console.log("🧠 [CRE MOCK] Returning consensus success.");
    res.json(mockSuccessResponse);
  }
}