import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { registerSchema, loginSchema } from "./auth.schema";
import { authenticate } from "../../middleware/auth";
import { authLimiter } from "../../middleware/rateLimiter";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), AuthController.register);
router.post("/login", authLimiter, validate(loginSchema), AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", authenticate, AuthController.logout);
router.get("/me", authenticate, AuthController.me);

export default router;