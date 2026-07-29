import { Router } from "express";
import { AnalyticsController } from "./analytics.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.use(authenticate);
router.get("/", AnalyticsController.getAnalytics);

export default router;