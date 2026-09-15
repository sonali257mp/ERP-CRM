import bcrypt from "bcryptjs";
import prisma from "../src/prisma";

async function main() {
  const password = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@erpcrm.com",
    },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@erpcrm.com",
      password,
      role: "ADMIN",
    },
  });

  console.log("Admin user created:", admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });