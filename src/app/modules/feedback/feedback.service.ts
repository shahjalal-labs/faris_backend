import { Request } from "express";
import prisma from "../../../shared/prisma";
import { uploadInSpace } from "../../../shared/UploadHelper";

const createFeedbackInDB = async (userId: string, content: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  await prisma.feedback.create({
    data: {
      userId,
      content,
    },
  });

  await prisma.dashNotify.create({
    data: {
      title: `New Feedback Received`,
      content: `${user.fullName} has provided new feedback.`,
      additionalDetails: "dsfsfsd",
    },
  });

  return;
};

const createOnboardings = async () => {
  const onboarding = await prisma.onboarding.findUnique({
    where: {
      key: "Faris",
    },
  });

  if (onboarding) {
    console.log("Onboarding already exists");
    return;
  }

  await prisma.onboarding.create({
    data: {
      key: "Faris",
      title: "Find Your Perfect Style.",
      content:
        "Discover top-rated s and beauty experts near you. Book hair, skin, and grooming services anytime.",
      fileUrl:
        "https://api.zenexcloud.com/emdadullah/uploads/messages/files/1772702516141-rei38c7rb2.png",
    },
  });
  return;
};

const createOnboarding = async (req: Request) => {
  const payload = req.body;
  const file = req.file;

  const processImage = async (file: Express.Multer.File, folder: string) => {
    if (!file) return null;
    return uploadInSpace(file, `courses/${folder}`);
  };

  const profileImage = file ? await processImage(file, "profileImage") : null;

  const onboarding = await prisma.onboarding.findUnique({
    where: {
      key: "Faris",
    },
  });

  if (onboarding) {
    await prisma.onboarding.update({
      where: {
        key: "Faris",
      },
      data: {
        content: payload.content ?? onboarding.content,
        title: payload.title ?? onboarding.title,
        fileUrl: profileImage ? profileImage : onboarding.fileUrl,
      },
    });
    return;
  } else {
    await prisma.onboarding.create({
      data: {
        content: payload.content,
        title: payload.title,
        key: "Faris",
        fileUrl: profileImage,
      },
    });
  }
};

const getOnboarding = async () => {
  const onboarding = await prisma.onboarding.findFirst();
  return onboarding;
};

const deleteFeedback = async (id: string) => {
  await prisma.feedback.delete({
    where: { id },
  });
  return;
};

export const feedbackService = {
  createFeedbackInDB,
  createOnboarding,
  createOnboardings,
  getOnboarding,
  deleteFeedback,
};
