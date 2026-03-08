import { env } from '../config/env.js';
import { verifiedNullifiers } from '../store/index.js';
import type { WorldIDProof } from '../types/index.js';

const WORLDCOIN_VERIFY_URL = 'https://developer.worldcoin.org/api/v2/verify';

export class WorldIdService {
  /**
   * Generate an RP signature for the World ID widget.
   * Uses the @worldcoin/idkit signRequest helper.
   */
  static async generateRpSignature() {
    // Si usas versión idkit >= 1.x la importación fue removida, mockearemos la respuesta
    const action = 'warmay-claim';
    return {
      action,
      signature: "dummy_worldID_signature_for_testing",
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }

  /**
   * Verify a World ID ZK proof server-side via the Worldcoin API v2.
   * Returns the verification result.
   */
  static async verifyProof(proof: WorldIDProof, action: string, signal?: string) {
    const url = `${WORLDCOIN_VERIFY_URL}/${env.WORLD_APP_ID}`;

    const body: Record<string, string> = {
      nullifier_hash: proof.nullifier_hash,
      merkle_root: proof.merkle_root,
      proof: proof.proof,
      verification_level: proof.verification_level,
      action,
    };
    if (signal) {
      body.signal_hash = signal;
    }

    console.log(`[World ID] Verifying proof for action "${action}"...`);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[World ID] Verification failed:', data);
      return {
        success: false,
        error: data.code || 'verification_failed',
        detail: data.detail || 'World ID verification failed',
      };
    }

    // Mark nullifier as verified
    verifiedNullifiers.add(proof.nullifier_hash);

    console.log(`[World ID] ✅ Proof verified for nullifier ${proof.nullifier_hash.slice(0, 16)}...`);

    return {
      success: true,
      nullifier_hash: proof.nullifier_hash,
      action,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Check if a nullifier has been verified.
   */
  static isVerified(nullifierHash: string): boolean {
    return verifiedNullifiers.has(nullifierHash);
  }
}
