import { env } from '../config/env.js';

export class CreMockService {
  static async triggerClaimFlow(beneficiary: string, idkitResponse: any) {
    console.log(`[Chainlink CRE] Triggering claim flow for beneficiary: ${beneficiary}`);
    console.log(`[Chainlink CRE] Payload injected with RP_ID: ${env.WORLD_RP_ID}`);
    
    // Mocking the injection to Chainlink CRE
    return {
      status: "success",
      cre_payload: {
        rp_id: env.WORLD_RP_ID,
        idkitResponse,
        beneficiary,
        timestamp: new Date().toISOString()
      }
    };
  }
}
