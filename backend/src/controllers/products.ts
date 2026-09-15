import { Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middleware/auth";

export async function getProducts(
  req: AuthRequest,
  res: Response
) {
  try {
    const search = String(req.query.search || "");

    const products = await prisma.product.findMany({
      where: search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                sku: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                category: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(products);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch products",
    });
  }
}

export async function getProductById(
  req: AuthRequest,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        stockMovements: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.json(product);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch product",
    });
  }
}

export async function createProduct(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      name,
      sku,
      category,
      unitPrice,
      currentStock,
      minimumStock,
      warehouseLocation,
    } = req.body;

    if (
      !name ||
      !sku ||
      !category ||
      unitPrice === undefined
    ) {
      return res.status(400).json({
        message:
          "Name, SKU, category and unit price are required",
      });
    }

    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        sku: String(sku).trim(),
        category: String(category).trim(),
        unitPrice: Number(unitPrice),
        currentStock:
          currentStock === undefined
            ? 0
            : Number(currentStock),
        minimumStock:
          minimumStock === undefined
            ? 0
            : Number(minimumStock),
        warehouseLocation:
          warehouseLocation
            ? String(warehouseLocation).trim()
            : undefined,
      },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create product",
    });
  }
}

export async function updateProduct(
  req: AuthRequest,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id,
        },
      });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const {
      name,
      sku,
      category,
      unitPrice,
      currentStock,
      minimumStock,
      warehouseLocation,
    } = req.body;

    const product = await prisma.product.update({
      where: {
        id,
      },
      data: {
        name:
          name !== undefined
            ? String(name).trim()
            : undefined,

        sku:
          sku !== undefined
            ? String(sku).trim()
            : undefined,

        category:
          category !== undefined
            ? String(category).trim()
            : undefined,

        unitPrice:
          unitPrice !== undefined
            ? Number(unitPrice)
            : undefined,

        currentStock:
          currentStock !== undefined
            ? Number(currentStock)
            : undefined,

        minimumStock:
          minimumStock !== undefined
            ? Number(minimumStock)
            : undefined,

        warehouseLocation:
          warehouseLocation !== undefined
            ? String(warehouseLocation).trim()
            : undefined,
      },
    });

    return res.json(product);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to update product",
    });
  }
}

export async function deleteProduct(
  req: AuthRequest,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id,
        },
      });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const movementCount =
      await prisma.stockMovement.count({
        where: {
          productId: id,
        },
      });

    const challanItemCount =
      await prisma.challanItem.count({
        where: {
          productId: id,
        },
      });

    if (
      movementCount > 0 ||
      challanItemCount > 0
    ) {
      return res.status(400).json({
        message:
          "Product cannot be deleted because it has stock movement or challan records",
      });
    }

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to delete product",
    });
  }
}