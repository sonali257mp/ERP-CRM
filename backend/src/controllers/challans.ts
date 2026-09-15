import { Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middleware/auth";

function generateChallanNumber(): string {
  const now = new Date();

  const datePart =
    `${now.getFullYear()}` +
    `${String(now.getMonth() + 1).padStart(2, "0")}` +
    `${String(now.getDate()).padStart(2, "0")}`;

  const randomPart = Math.floor(
    100000 + Math.random() * 900000
  );

  return `CH-${datePart}-${randomPart}`;
}

export async function getChallans(
  req: AuthRequest,
  res: Response
) {
  try {
    const challans = await prisma.challan.findMany({
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(challans);
  } catch (error) {
    console.error("Get challans error:", error);

    return res.status(500).json({
      message: "Failed to fetch challans",
    });
  }
}

export async function getChallanById(
  req: AuthRequest,
  res: Response
) {
  try {
    const challanId = Number(req.params.id);

    if (
      !Number.isInteger(challanId) ||
      challanId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid challan ID",
      });
    }

    const challan =
      await prisma.challan.findUnique({
        where: {
          id: challanId,
        },
        include: {
          customer: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          items: true,
        },
      });

    if (!challan) {
      return res.status(404).json({
        message: "Challan not found",
      });
    }

    return res.json(challan);
  } catch (error) {
    console.error("Get challan error:", error);

    return res.status(500).json({
      message: "Failed to fetch challan",
    });
  }
}

export async function createChallan(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      customerId,
      items,
      status = "DRAFT",
    } = req.body;

    if (!customerId) {
      return res.status(400).json({
        message: "Customer is required",
      });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        message: "Items must be an array",
      });
    }

    if (items.length === 0) {
      return res.status(400).json({
        message:
          "At least one product is required",
      });
    }

    if (
      status !== "DRAFT" &&
      status !== "CONFIRMED"
    ) {
      return res.status(400).json({
        message:
          "Status must be DRAFT or CONFIRMED",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const customerIdNumber =
      Number(customerId);

    if (
      !Number.isInteger(customerIdNumber) ||
      customerIdNumber <= 0
    ) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const customer =
      await prisma.customer.findUnique({
        where: {
          id: customerIdNumber,
        },
      });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    /*
     * Validate products and quantities.
     *
     * unitPrice is kept as a STRING because
     * Prisma stores Product.unitPrice as Decimal.
     */
    const validatedItems: {
      productId: number;
      productName: string;
      sku: string;
      unitPrice: string;
      quantity: number;
    }[] = [];

    for (const item of items) {
      const productId = Number(
        item.productId
      );

      const quantity = Number(
        item.quantity
      );

      if (
        !Number.isInteger(productId) ||
        productId <= 0
      ) {
        return res.status(400).json({
          message: "Invalid product ID",
        });
      }

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          message:
            "Quantity must be a positive whole number",
        });
      }

      const product =
        await prisma.product.findUnique({
          where: {
            id: productId,
          },
        });

      if (!product) {
        return res.status(404).json({
          message:
            `Product with ID ${productId} not found`,
        });
      }

      if (
        status === "CONFIRMED" &&
        product.currentStock < quantity
      ) {
        return res.status(400).json({
          message:
            `Insufficient stock for ${product.name}. ` +
            `Available stock: ${product.currentStock}, ` +
            `requested: ${quantity}`,
        });
      }

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,

        // Prisma Decimal → string
        unitPrice:
          product.unitPrice.toString(),

        quantity,
      });
    }

    const totalQuantity =
      validatedItems.reduce(
        (total, item) =>
          total + item.quantity,
        0
      );

    /*
     * Create the challan.
     *
     * CONFIRMED:
     *   - Reduce stock
     *   - Create OUT stock movement
     *   - Create challan
     *
     * DRAFT:
     *   - Create challan
     *   - Do NOT change stock
     */
    const result =
      await prisma.$transaction(
        async (tx) => {
          if (status === "CONFIRMED") {
            for (const item of validatedItems) {
              const product =
                await tx.product.findUnique({
                  where: {
                    id: item.productId,
                  },
                });

              if (!product) {
                throw new Error(
                  `Product ${item.productId} not found`
                );
              }

              if (
                product.currentStock <
                item.quantity
              ) {
                throw new Error(
                  `Insufficient stock for ${product.name}`
                );
              }

              await tx.product.update({
                where: {
                  id: item.productId,
                },
                data: {
                  currentStock:
                    product.currentStock -
                    item.quantity,
                },
              });

              await tx.stockMovement.create({
                data: {
                  productId:
                    item.productId,
                  quantity:
                    item.quantity,
                  type: "OUT",
                  reason:
                    "Sales challan",
                  createdBy:
                    req.user!.userId,
                },
              });
            }
          }

          const challan =
            await tx.challan.create({
              data: {
                challanNumber:
                  generateChallanNumber(),

                customerId:
                  customerIdNumber,

                totalQuantity,

                status,

                createdBy:
                  req.user!.userId,

                items: {
                  create:
                    validatedItems.map(
                      (item) => ({
                        productId:
                          item.productId,

                        productName:
                          item.productName,

                        sku:
                          item.sku,

                        /*
                         * String is accepted by Prisma
                         * for a Decimal field.
                         */
                        unitPrice:
                          item.unitPrice,

                        quantity:
                          item.quantity,
                      })
                    ),
                },
              },

              include: {
                customer: true,
                items: true,
              },
            });

          return challan;
        }
      );

    return res.status(201).json(result);
  } catch (error) {
    console.error(
      "Create challan error:",
      error
    );

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to create challan",
    });
  }
}

export async function cancelChallan(
  req: AuthRequest,
  res: Response
) {
  try {
    const challanId = Number(req.params.id);

    if (
      !Number.isInteger(challanId) ||
      challanId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid challan ID",
      });
    }

    const challan =
      await prisma.challan.findUnique({
        where: {
          id: challanId,
        },
        include: {
          items: true,
        },
      });

    if (!challan) {
      return res.status(404).json({
        message: "Challan not found",
      });
    }

    if (challan.status === "CANCELLED") {
      return res.status(400).json({
        message: "Challan is already cancelled",
      });
    }

    /*
     * A confirmed challan has already reduced stock.
     * Therefore, cancelling it must restore that stock.
     */
    const result =
      await prisma.$transaction(
        async (tx) => {
          if (
            challan.status === "CONFIRMED"
          ) {
            for (const item of challan.items) {
              const product =
                await tx.product.findUnique({
                  where: {
                    id: item.productId,
                  },
                });

              if (!product) {
                throw new Error(
                  `Product ${item.productId} not found`
                );
              }

              await tx.product.update({
                where: {
                  id: item.productId,
                },
                data: {
                  currentStock:
                    product.currentStock +
                    item.quantity,
                },
              });

              await tx.stockMovement.create({
                data: {
                  productId:
                    item.productId,
                  quantity:
                    item.quantity,
                  type: "IN",
                  reason:
                    `Cancelled challan ${challan.challanNumber}`,
                  createdBy:
                    req.user!.userId,
                },
              });
            }
          }

          return tx.challan.update({
            where: {
              id: challanId,
            },
            data: {
              status: "CANCELLED",
            },
            include: {
              customer: true,
              items: true,
            },
          });
        }
      );

    return res.json(result);
  } catch (error) {
    console.error(
      "Cancel challan error:",
      error
    );

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to cancel challan",
    });
  }
}