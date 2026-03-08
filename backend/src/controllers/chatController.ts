import { Request, Response } from 'express';
import { AiService } from '../services/aiService.js';
import { chatHistory } from '../store/index.js';
import type { ChatMessage } from '../types/index.js';

export class ChatController {
  /** POST /chat (legacy) */
  static async handleChat(req: Request, res: Response) {
    const { message, language = 'es' } = req.body;

    if (!message) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_MESSAGE', message: 'message is required' },
      });
      return;
    }

    const result = await AiService.chat(message, language);
    res.json({ success: true, data: result });
  }

  /** POST /chat/message */
  static async sendMessage(req: Request, res: Response) {
    const { maternal_id, message, language = 'es', context } = req.body;

    if (!message) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_MESSAGE', message: 'message is required' },
      });
      return;
    }

    const userId = maternal_id || 'user_demo_001';

    // Store user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: message,
      language,
      created_at: new Date().toISOString(),
    };

    const history = chatHistory.get(userId) || [];
    history.push(userMsg);

    // Get AI response
    const aiResult = await AiService.chat(message, language, context);

    // Store AI message
    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: aiResult.message,
      language: aiResult.language,
      metadata: {
        risk_detected: aiResult.risk_detected,
        escalate_to_professional: aiResult.escalate,
      },
      created_at: new Date().toISOString(),
    };
    history.push(aiMsg);
    chatHistory.set(userId, history);

    res.json({
      success: true,
      data: aiResult,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }

  /** GET /chat/history */
  static async getHistory(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 50;
    const userId = req.query.maternal_id as string || 'user_demo_001';

    const history = (chatHistory.get(userId) || []).slice(-limit);

    res.json({
      success: true,
      data: history,
      meta: { timestamp: new Date().toISOString(), request_id: crypto.randomUUID() },
    });
  }
}
