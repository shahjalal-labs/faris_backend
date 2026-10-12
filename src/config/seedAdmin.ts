import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import prisma from "../shared/prisma";

const superAdminData = {
  name: "Faris",
  email: "admin.faris@gmail.com",
  password: "12345Aa@",
};

const seedSuperAdmin = async () => {
  try {
    // Check if a super admin already exists
    const isSuperAdminExists = await prisma.admin.findFirst({
      where: {
        email: superAdminData.email,
      },
    });

    const isFakeAdminExists = await prisma.user.findFirst({
      where: { role: "Admin" },
    });

    const hashedPassword = await bcrypt.hash(
      superAdminData.password as string,
      10,
    );

    if (!isFakeAdminExists) {
      await prisma.user.create({
        data: {
          role: "Admin",
          email: "fake@gmail.com",
          fullName: "Shaara",
          phoneNumber: "01700000000",
          password: hashedPassword,
          status: "Active",
        },
      });
    }

    // If not, create one
    if (!isSuperAdminExists) {
      await prisma.admin.create({
        data: {
          adminName: superAdminData.name,
          email: superAdminData.email,
          password: hashedPassword,
          editing: true,
          viewing: true,
          aic: true,
          bbm: true,
          bm: true,
          cm: true,
          cr: true,
          dashboard: true,
          earnings: true,
          in: true,
          sm: true,
          vo: true,
        },
      });
      console.log("🦸 Super Admin created successfully.");
    } else {
      return;
    }
  } catch (error) {
    console.error("Error seeding Super Admin:", error);
  }
};

export default seedSuperAdmin;
