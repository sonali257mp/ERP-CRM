import { Router } from "express";

import {
  getChallans,
  getChallanById,
  createChallan,
  cancelChallan,
} from "../controllers/challans";

import { authenticateToken } from "../middleware/auth";
import { requireRole } from "../middleware/role";

const router = Router();

router.get(
  "/",
  authenticateToken,
  getChallans
);

router.get(
  "/:id",
  authenticateToken,
  getChallanById
);

router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN", "SALES"),
  createChallan
);

router.put(
  "/:id/cancel",
  authenticateToken,
  requireRole("ADMIN", "SALES"),
  cancelChallan
);

export default router;