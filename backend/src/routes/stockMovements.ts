import { Router } from "express";

import {
  getStockMovements,
  createStockMovement,
} from "../controllers/stockMovements";

import { authenticateToken } from "../middleware/auth";
import { requireRole } from "../middleware/role";

const router = Router();

router.get(
  "/",
  authenticateToken,
  getStockMovements
);

router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN", "WAREHOUSE"),
  createStockMovement
);

export default router;