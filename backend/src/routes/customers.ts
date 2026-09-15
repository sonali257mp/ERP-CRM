import { Router } from "express";
import {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  addFollowUp,
  getFollowUps,
} from "../controllers/customers";
import { authenticateToken } from "../middleware/auth";
import { requireRole } from "../middleware/role";

const router = Router();

router.get(
  "/",
  authenticateToken,
  getCustomers
);

router.get(
  "/followups",
  authenticateToken,
  getFollowUps
);

router.get(
  "/:id",
  authenticateToken,
  getCustomerById
);

router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN", "SALES"),
  updateCustomer
);

router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN", "SALES"),
  createCustomer
);

router.post(
  "/:id/followups",
  authenticateToken,
  requireRole("ADMIN", "SALES"),
  addFollowUp
);

export default router;