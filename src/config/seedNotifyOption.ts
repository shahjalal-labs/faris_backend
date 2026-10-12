import prisma from "../shared/prisma";

const seedNotifyOption = async () => {
  try {
    const isNotifyOptionExists = await prisma.notifyOption.findFirst({});

    if (!isNotifyOptionExists) {
      await prisma.notifyOption.create({
        data: {
          bookingCancelled: true,
        },
      });
      console.log("🦸 Notify Option created successfully.");
    } else {
      return;
    }
  } catch (error) {
    console.error("Error seeding Notify Option:", error);
  }
};

export default seedNotifyOption;
