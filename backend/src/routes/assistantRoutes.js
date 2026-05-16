import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { answerAssistantQuestion } from "../services/assistantService.js";

const router = Router();

router.post("/chat", requireAuth, async (req, res) => {
  const { question, lat, lng } = req.body ?? {};
  const result = await answerAssistantQuestion({ question, lat, lng });
  return res.json(result);
});

export default router;
