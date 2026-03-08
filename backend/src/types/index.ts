// ─── World ID ────────────────────────────────────────────────────────────────

export interface WorldIDProof {
  merkle_root: string;
  nullifier_hash: string;
  proof: string;
  verification_level: 'orb' | 'device';
}

export interface WorldIDVerifyRequest {
  proof: WorldIDProof;
  action: string;
  signal?: string;
}

export interface WorldIDVerifyResponse {
  success: boolean;
  nullifier_hash: string;
  action: string;
  created_at: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface MaternalUser {
  id: string;
  world_id_nullifier: string;
  name: string;
  age: number;
  weeks_pregnant: number;
  risk_level: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  location: {
    lat: number;
    lng: number;
    department: string;
    municipality: string;
  };
  created_at: string;
  verified_at: string;
}

// ─── Prenatal Controls ───────────────────────────────────────────────────────

export interface PrenatalControl {
  id: string;
  maternal_id: string;
  week_number: number;
  type: 'primera_visita' | 'ecografia' | 'analisis' | 'control_presion' | 'vacuna';
  status: 'pendiente' | 'completado' | 'verificado_blockchain';
  professional_id: string;
  data: {
    blood_pressure?: string;
    weight?: number;
    fetal_heartbeat?: number;
    notes?: string;
  };
  blockchain_tx?: string;
  created_at: string;
  verified_at?: string;
}

// ─── Tokens ──────────────────────────────────────────────────────────────────

export interface TokenBalance {
  address: string;
  balance: number;
  pending_claims: number;
  total_earned: number;
  last_claim_at?: string;
}

export interface TokenClaim {
  id: string;
  maternal_id: string;
  amount: number;
  reason: 'control_prenatal' | 'emergencia_reportada' | 'referido' | 'bonus_cre';
  control_id?: string;
  blockchain_tx: string;
  status: 'pending' | 'confirmed' | 'failed';
  created_at: string;
}

// ─── Emergency ───────────────────────────────────────────────────────────────

export interface EmergencyAlert {
  id: string;
  maternal_id: string;
  type: 'SOS' | 'sintoma_grave' | 'trabajo_parto';
  location: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  status: 'activa' | 'atendida' | 'resuelta' | 'cancelada';
  nearest_hospitals: Hospital[];
  trust_network_notified: boolean;
  ambulance_dispatched: boolean;
  blockchain_tx?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Hospital {
  id: string;
  name: string;
  distance_km: number;
  estimated_time_min: number;
  has_ambulance: boolean;
  specialty: string[];
  phone: string;
  status: 'disponible' | 'ocupado' | 'sin_capacidad';
}

// ─── Trust Network ───────────────────────────────────────────────────────────

export interface TrustContact {
  id: string;
  maternal_id: string;
  name: string;
  phone: string;
  relationship: 'esposo' | 'madre' | 'padre' | 'hermano' | 'medico' | 'partera' | 'otro';
  is_verified: boolean;
  can_receive_alerts: boolean;
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  language: 'es' | 'qu' | 'ay';
  metadata?: {
    risk_detected?: boolean;
    symptoms_mentioned?: string[];
    escalate_to_professional?: boolean;
  };
  created_at: string;
}

export interface ChatRequest {
  maternal_id: string;
  message: string;
  language: 'es' | 'qu' | 'ay';
  context?: {
    weeks_pregnant: number;
    risk_level: string;
    recent_symptoms?: string[];
  };
}

export interface ChatResponse {
  message: string;
  language: 'es' | 'qu' | 'ay';
  risk_detected: boolean;
  recommendations: string[];
  escalate: boolean;
}

// ─── Chainlink CRE ──────────────────────────────────────────────────────────

export interface CREWorkflowResult {
  execution_id: string;
  status: 'success' | 'failed' | 'pending';
  result?: Record<string, unknown>;
  tx_hash?: string;
  consensus_reached: boolean;
  nodes_participated: number;
}

// ─── API Response ────────────────────────────────────────────────────────────

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    timestamp: string;
    request_id: string;
  };
}
