import { env } from '../config/env.js';
import { creExecutions } from '../store/index.js';
import type { CREWorkflowResult } from '../types/index.js';

/**
 * Real Chainlink CRE integration via HTTP trigger.
 *
 * The CRE workflow is a separate WASM binary deployed via `cre workflow deploy`.
 * This service triggers it via the workflow's HTTP trigger URL and tracks execution.
 */
export class CreService {
  /**
   * Trigger a deployed CRE workflow via its HTTP trigger endpoint.
   */
  static async triggerWorkflow(
    payload: Record<string, unknown>
  ): Promise<CREWorkflowResult> {
    const executionId = crypto.randomUUID();

    // If CRE workflow URL is configured, make a real HTTP call
    if (env.CRE_WORKFLOW_TRIGGER_URL) {
      try {
        console.log(`[CRE] Triggering workflow at ${env.CRE_WORKFLOW_TRIGGER_URL}`);

        const response = await fetch(env.CRE_WORKFLOW_TRIGGER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            execution_id: executionId,
            ...payload,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[CRE] Workflow trigger failed (${response.status}):`, errorText);

          const result: CREWorkflowResult = {
            execution_id: executionId,
            status: 'failed',
            consensus_reached: false,
            nodes_participated: 0,
            result: { error: errorText },
          };
          creExecutions.set(executionId, result);
          return result;
        }

        const data = await response.json();
        console.log(`[CRE] ✅ Workflow triggered successfully:`, data);

        const result: CREWorkflowResult = {
          execution_id: data.execution_id || executionId,
          status: data.status || 'pending',
          tx_hash: data.tx_hash,
          consensus_reached: data.consensus_reached ?? false,
          nodes_participated: data.nodes_participated ?? 0,
          result: data,
        };
        creExecutions.set(result.execution_id, result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'CRE trigger failed';
        console.error('[CRE] ❌ Error:', message);

        const result: CREWorkflowResult = {
          execution_id: executionId,
          status: 'failed',
          consensus_reached: false,
          nodes_participated: 0,
          result: { error: message },
        };
        creExecutions.set(executionId, result);
        return result;
      }
    }

    // Fallback: CRE not configured — log payload for manual CLI trigger
    console.log(`[CRE] ⚠️ CRE_WORKFLOW_TRIGGER_URL not set. Payload for manual trigger:`);
    console.log(JSON.stringify(payload, null, 2));
    console.log(`[CRE] Run: cre workflow simulate warmay-workflow --input '${JSON.stringify(payload)}'`);

    const result: CREWorkflowResult = {
      execution_id: executionId,
      status: 'pending',
      consensus_reached: false,
      nodes_participated: 0,
      result: {
        message: 'CRE workflow trigger URL not configured. Use CRE CLI to trigger manually.',
        payload,
      },
    };
    creExecutions.set(executionId, result);
    return result;
  }

  /**
   * Get the status of a CRE workflow execution.
   */
  static getExecutionStatus(executionId: string): CREWorkflowResult | null {
    return creExecutions.get(executionId) ?? null;
  }

  /**
   * Update an execution status (called by webhook or polling).
   */
  static updateExecution(executionId: string, update: Partial<CREWorkflowResult>): void {
    const existing = creExecutions.get(executionId);
    if (existing) {
      creExecutions.set(executionId, { ...existing, ...update });
    }
  }

  /**
   * Trigger the full claim flow: verify World ID + trigger CRE + optionally execute on-chain.
   */
  static async triggerClaimFlow(
    beneficiary: string,
    idkitResponse: Record<string, unknown>
  ): Promise<CREWorkflowResult> {
    const payload = {
      rp_id: env.WORLD_RP_ID,
      beneficiary,
      idkitResponse,
      action: 'warmay-claim',
      timestamp: new Date().toISOString(),
    };

    return this.triggerWorkflow(payload);
  }
}
