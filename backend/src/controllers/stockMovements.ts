import { Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middleware/auth";

export async function getStockMovements(
  req: AuthRequest,
  res: Response
) {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: {
        product: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(movements);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch stock movements",
    });
  }
}

export async function createStockMovement(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      productId,
      quantity,
      type,
      reason,
    } = req.body;

    if (
      productId === undefined ||
      quantity === undefined ||
      !type ||
      !reason
    ) {
      return res.status(400).json({
        message:
          "Product, quantity, type and reason are required",
      });
    }

    const productIdNumber = Number(productId);
    const quantityNumber = Number(quantity);

    if (
      !Number.isInteger(productIdNumber) ||
      productIdNumber <= 0
    ) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    if (
      !Number.isInteger(quantityNumber) ||
      quantityNumber <= 0
    ) {
      return res.status(400).json({
        message:
          "Quantity must be a positive whole number",
      });
    }

    if (type !== "IN" && type !== "OUT") {
      return res.status(400).json({
        message:
          "Stock movement type must be IN or OUT",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productIdNumber,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (
      type === "OUT" &&
      product.currentStock < quantityNumber
    ) {
      return res.status(400).json({
        message:
          "Insufficient stock for this stock OUT movement",
      });
    }

    const newStock =
      type === "IN"
        ? product.currentStock + quantityNumber
        : product.currentStock - quantityNumber;

    const movement =
      await prisma.$transaction(async (tx) => {
        const updatedProduct =
          await tx.product.update({
            where: {
              id: productIdNumber,
            },
            data: {
              currentStock: newStock,
            },
          });

        const stockMovement =
          await tx.stockMovement.create({
            data: {
              productId: productIdNumber,
              quantity: quantityNumber,
              type,
              reason: reason.trim(),
              createdBy: req.user!.userId,
            },
            include: {
              product: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          });

        return {
          updatedProduct,
          stockMovement,
        };
      });

    return res.status(201).json(movement);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to create stock movement",
    });
  }
}