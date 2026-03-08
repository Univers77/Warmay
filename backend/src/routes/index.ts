import { Router } from 'express';
import { ClaimController } from '../controllers/claimController.js';
import { WorldIdController } from '../controllers/worldIdController.js';
import { UserController } from '../controllers/userController.js';
import { ControlsController } from '../controllers/controlsController.js';
import { TokensController } from '../controllers/tokensController.js';
import { EmergencyController } from '../controllers/emergencyController.js';
import { TrustNetworkController } from '../controllers/trustNetworkController.js';
import { ChatController } from '../controllers/chatController.js';
import { CreController } from '../controllers/creController.js';
import { BlockchainController } from '../controllers/blockchainController.js';
import { CRESimulateController } from '../controllers/creSimulateController.js';
const router = Router();
// ─── World ID Authentication ─────────────────────────────────────────────────
router.post('/worldid/rp-signature', ClaimController.generateSignature);
router.post('/auth/world-id/verify', WorldIdController.verify);
router.get('/auth/world-id/status/:hash', WorldIdController.status);

// ─── Claim Flow (Chainlink CRE) ─────────────────────────────────────────────
router.post('/claim', ClaimController.startClaim);

// ─── User Management ─────────────────────────────────────────────────────────
router.get('/user/me', UserController.getMe);
router.patch('/user/me', UserController.updateMe);
router.post('/user/location', UserController.updateLocation);

// ─── Prenatal Controls ───────────────────────────────────────────────────────
router.get('/controls', ControlsController.getAll);
router.get('/controls/:id', ControlsController.getById);
router.post('/controls/:id/verify', ControlsController.verify);

// ─── Tokens MOM ──────────────────────────────────────────────────────────────
router.get('/tokens/balance', TokensController.getBalance);
router.post('/tokens/claim', TokensController.claim);
router.get('/tokens/history', TokensController.history);

// ─── Emergency System ────────────────────────────────────────────────────────
router.post('/emergency', EmergencyController.handleEmergency);
router.post('/emergency/trigger', EmergencyController.trigger);
router.get('/emergency/active', EmergencyController.getActive);
router.post('/emergency/:id/cancel', EmergencyController.cancel);
router.get('/emergency/hospitals', EmergencyController.getNearestHospitals);

// ─── Trust Network ───────────────────────────────────────────────────────────
router.get('/trust-network', TrustNetworkController.getAll);
router.post('/trust-network', TrustNetworkController.add);
router.delete('/trust-network/:id', TrustNetworkController.remove);

// ─── AI Chat ─────────────────────────────────────────────────────────────────
router.post('/chat', ChatController.handleChat);
router.post('/chat/message', ChatController.sendMessage);
router.get('/chat/history', ChatController.getHistory);

// ─── Chainlink CRE ──────────────────────────────────────────────────────────
router.post('/cre/trigger', CreController.trigger);
router.get('/cre/status/:id', CreController.status);
router.post('/cre/simulate-webhook', CRESimulateController.handleWebhook);

// ─── Blockchain ──────────────────────────────────────────────────────────────
router.get('/blockchain/transactions', BlockchainController.getTransactions);
router.get('/blockchain/verify/:txHash', BlockchainController.verifyTx);

export default router;
