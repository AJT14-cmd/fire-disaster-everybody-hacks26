import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { computeBestEvacuationRoute } from "../services/routeService.js";
import { emitEvent } from "../services/websocketService.js";

const router = Router();

router.post("/evacuation", requireAuth, async (req, res) => {
  const result = computeBestEvacuationRoute(req.body);
  emitEvent("route.recommendation", { userId: req.user.uid, route: result });
  return res.json(result);
});

export default router;
