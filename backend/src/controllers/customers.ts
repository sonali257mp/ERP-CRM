import { Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middleware/auth";

export async function getCustomers(req: AuthRequest, res: Response) {
  try {
    const search = String(req.query.search || "");

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { mobile: { contains: search, mode: "insensitive" } },
              { businessName: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(customers);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch customers",
    });
  }
}

export async function createCustomer(req: AuthRequest, res: Response) {
  try {
    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
      notes,
    } = req.body;

    if (!name || !mobile || !customerType) {
      return res.status(400).json({
        message: "Name, mobile and customer type are required",
      });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email,
        businessName,
        gstNumber,
        customerType,
        address,
        status,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        notes,
      },
    });

    return res.status(201).json(customer);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create customer",
    });
  }
}
export async function getCustomerById(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followUps: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    return res.json(customer);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch customer",
    });
  }
}
export async function updateCustomer(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
      notes,
    } = req.body;

    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        mobile,
        email,
        businessName,
        gstNumber,
        customerType,
        address,
        status,
        followUpDate: followUpDate
          ? new Date(followUpDate)
          : undefined,
        notes,
      },
    });

    return res.json(customer);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to update customer",
    });
  }
}
export async function addFollowUp(req: AuthRequest, res: Response) {
  try {
    const customerId = Number(req.params.id);

    if (isNaN(customerId)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const { note, followUpDate } = req.body;

    if (!note || !followUpDate) {
      return res.status(400).json({
        message: "Note and follow-up date are required",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const followUp = await prisma.followUp.create({
      data: {
        customerId,
        note,
        followUpDate: new Date(followUpDate),
        createdBy: req.user!.userId,
      },
    });

    return res.status(201).json(followUp);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to add follow-up",
    });
  }
}

export async function getFollowUps(
  req: AuthRequest,
  res: Response
) {
  try {
    const followUps = await prisma.followUp.findMany({
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        followUpDate: "asc",
      },
    });

    return res.json(followUps);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch follow-ups",
    });
  }
}