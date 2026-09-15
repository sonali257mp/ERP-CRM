import { Router } from "express";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products";

import { authenticateToken } from "../middleware/auth";
import { requireRole } from "../middleware/role";

const router = Router();

router.get(
  "/",
  authenticateToken,
  getProducts
);

router.get(
  "/:id",
  authenticateToken,
  getProductById
);

router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN", "WAREHOUSE"),
  createProduct
);

router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN", "WAREHOUSE"),
  updateProduct
);

router.delete(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  deleteProduct
);

export default router;