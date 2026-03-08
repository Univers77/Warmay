import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // World ID
  WORLD_APP_ID: z.string(),
  WORLD_RP_ID: z.string(),
  RP_SIGNING_KEY: z.string(),

  // Blockchain (Sepolia)
  SEPOLIA_RPC_URL: z.string().default('https://rpc.sepolia.org'),
  MOM_TOKEN_ADDRESS: z.string().default(''),
  SUBSIDY_VAULT_ADDRESS: z.string().default(''),
  EXECUTOR_PRIVATE_KEY: z.string().default(''),

  // Chainlink CRE
  CRE_WORKFLOW_TRIGGER_URL: z.string().default(''),

  // Twilio (optional — falls back to console.log)
  TWILIO_ACCOUNT_SID: z.string().optional().default(''),
  TWILIO_AUTH_TOKEN: z.string().optional().default(''),
  TWILIO_FROM_NUMBER: z.string().optional().default(''),

  // DeepSeek AI (optional — falls back to keyword-based responses)
  DEEPSEEK_API_KEY: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
