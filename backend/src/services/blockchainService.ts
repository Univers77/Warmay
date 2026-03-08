import { ethers } from 'ethers';
import { env } from '../config/env.js';

// Minimal ABIs for reading contract state
const MOM_TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
];

const SUBSIDY_VAULT_ABI = [
  'function isNullifierUsed(uint256 nullifierHash) view returns (bool)',
  'function momToken() view returns (address)',
  'function PRENATAL_AMOUNT() view returns (uint256)',
  'function PARTO_AMOUNT() view returns (uint256)',
  'function POSTPARTO_AMOUNT() view returns (uint256)',
  'function claim(address beneficiary, uint256 nullifierHash, string controlType)',
  'event SubsidyClaimed(address indexed beneficiary, uint256 nullifierHash, string controlType, uint256 amount)',
];

let provider: ethers.JsonRpcProvider | null = null;
let momToken: ethers.Contract | null = null;
let subsidyVault: ethers.Contract | null = null;

function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(env.SEPOLIA_RPC_URL);
  }
  return provider;
}

function getMomToken(): ethers.Contract | null {
  if (!env.MOM_TOKEN_ADDRESS) return null;
  if (!momToken) {
    momToken = new ethers.Contract(env.MOM_TOKEN_ADDRESS, MOM_TOKEN_ABI, getProvider());
  }
  return momToken;
}

function getSubsidyVault(): ethers.Contract | null {
  if (!env.SUBSIDY_VAULT_ADDRESS) return null;
  if (!subsidyVault) {
    subsidyVault = new ethers.Contract(env.SUBSIDY_VAULT_ADDRESS, SUBSIDY_VAULT_ABI, getProvider());
  }
  return subsidyVault;
}

export class BlockchainService {
  /**
   * Get MOM token balance for an address.
   */
  static async getTokenBalance(address: string): Promise<{ balance: string; raw: bigint }> {
    const token = getMomToken();
    if (!token) {
      return { balance: '0', raw: 0n };
    }
    const raw: bigint = await token.balanceOf(address);
    const balance = ethers.formatUnits(raw, 18);
    return { balance, raw };
  }

  /**
   * Check if a nullifier has already been used on-chain.
   */
  static async isNullifierUsed(nullifierHash: string): Promise<boolean> {
    const vault = getSubsidyVault();
    if (!vault) return false;
    return vault.isNullifierUsed(nullifierHash);
  }

  /**
   * Verify a transaction on Sepolia.
   */
  static async verifyTransaction(txHash: string): Promise<{
    confirmed: boolean;
    block_number?: number;
    from?: string;
    to?: string;
  }> {
    try {
      const receipt = await getProvider().getTransactionReceipt(txHash);
      if (!receipt) {
        return { confirmed: false };
      }
      return {
        confirmed: receipt.status === 1,
        block_number: receipt.blockNumber,
        from: receipt.from,
        to: receipt.to ?? undefined,
      };
    } catch {
      return { confirmed: false };
    }
  }

  /**
   * Execute a claim on the SubsidyVault contract.
   * Requires EXECUTOR_PRIVATE_KEY to be set.
   */
  static async executeClaim(
    beneficiary: string,
    nullifierHash: string,
    controlType: string
  ): Promise<{ tx_hash: string } | { error: string }> {
    if (!env.EXECUTOR_PRIVATE_KEY || !env.SUBSIDY_VAULT_ADDRESS) {
      return { error: 'Blockchain not configured (missing EXECUTOR_PRIVATE_KEY or SUBSIDY_VAULT_ADDRESS)' };
    }

    try {
      const wallet = new ethers.Wallet(env.EXECUTOR_PRIVATE_KEY, getProvider());
      const vault = new ethers.Contract(env.SUBSIDY_VAULT_ADDRESS, SUBSIDY_VAULT_ABI, wallet);

      const tx = await vault.claim(beneficiary, nullifierHash, controlType);
      const receipt = await tx.wait();

      console.log(`[Blockchain] ✅ Claim executed: ${receipt.hash}`);
      return { tx_hash: receipt.hash };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown blockchain error';
      console.error('[Blockchain] ❌ Claim failed:', message);
      return { error: message };
    }
  }

  /**
   * Check if contracts are configured and accessible.
   */
  static isConfigured(): boolean {
    return !!(env.MOM_TOKEN_ADDRESS && env.SUBSIDY_VAULT_ADDRESS && env.SEPOLIA_RPC_URL);
  }
}
