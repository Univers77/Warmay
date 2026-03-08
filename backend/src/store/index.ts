import type {
  MaternalUser,
  PrenatalControl,
  TokenClaim,
  EmergencyAlert,
  TrustContact,
  ChatMessage,
  CREWorkflowResult,
} from '../types/index.js';

// ─── In-memory store (replace with DB in production) ────────────────────────

export const users = new Map<string, MaternalUser>();
export const controls = new Map<string, PrenatalControl>();
export const tokenClaims = new Map<string, TokenClaim>();
export const emergencies = new Map<string, EmergencyAlert>();
export const trustContacts = new Map<string, TrustContact>();
export const chatHistory = new Map<string, ChatMessage[]>();
export const creExecutions = new Map<string, CREWorkflowResult>();
export const verifiedNullifiers = new Set<string>();
export const transactions: Array<{ tx_hash: string; type: string; timestamp: string }> = [];

// ─── Seed demo data ──────────────────────────────────────────────────────────

const demoUserId = 'user_demo_001';

users.set(demoUserId, {
  id: demoUserId,
  world_id_nullifier: '',
  name: 'Maria Quispe',
  age: 28,
  weeks_pregnant: 24,
  risk_level: 'BAJO',
  location: {
    lat: -16.5,
    lng: -68.15,
    department: 'La Paz',
    municipality: 'La Paz',
  },
  created_at: new Date().toISOString(),
  verified_at: '',
});

const controlIds = ['ctrl_001', 'ctrl_002', 'ctrl_003', 'ctrl_004'];
const controlData: PrenatalControl[] = [
  {
    id: controlIds[0],
    maternal_id: demoUserId,
    week_number: 8,
    type: 'primera_visita',
    status: 'verificado_blockchain',
    professional_id: 'dr_001',
    data: { blood_pressure: '110/70', weight: 58, notes: 'Todo normal' },
    blockchain_tx: '0xabc123...demo',
    created_at: '2025-12-15T10:00:00Z',
    verified_at: '2025-12-15T10:05:00Z',
  },
  {
    id: controlIds[1],
    maternal_id: demoUserId,
    week_number: 16,
    type: 'ecografia',
    status: 'completado',
    professional_id: 'dr_002',
    data: { fetal_heartbeat: 145, weight: 60, notes: 'Ecografia normal, bebe sano' },
    created_at: '2026-01-20T09:00:00Z',
  },
  {
    id: controlIds[2],
    maternal_id: demoUserId,
    week_number: 24,
    type: 'control_presion',
    status: 'completado',
    professional_id: 'dr_001',
    data: { blood_pressure: '115/75', weight: 62 },
    created_at: '2026-03-01T11:00:00Z',
  },
  {
    id: controlIds[3],
    maternal_id: demoUserId,
    week_number: 28,
    type: 'analisis',
    status: 'pendiente',
    professional_id: 'dr_001',
    data: {},
    created_at: '2026-03-15T00:00:00Z',
  },
];

controlData.forEach(c => controls.set(c.id, c));

tokenClaims.set('claim_001', {
  id: 'claim_001',
  maternal_id: demoUserId,
  amount: 20,
  reason: 'control_prenatal',
  control_id: controlIds[0],
  blockchain_tx: '0xabc123...demo',
  status: 'confirmed',
  created_at: '2025-12-15T10:05:00Z',
});

trustContacts.set('tc_001', {
  id: 'tc_001',
  maternal_id: demoUserId,
  name: 'Juan Quispe',
  phone: '+59171234567',
  relationship: 'esposo',
  is_verified: true,
  can_receive_alerts: true,
});

trustContacts.set('tc_002', {
  id: 'tc_002',
  maternal_id: demoUserId,
  name: 'Dr. Rodriguez',
  phone: '+59172345678',
  relationship: 'medico',
  is_verified: true,
  can_receive_alerts: true,
});
