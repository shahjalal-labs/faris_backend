import { Request } from "express";
import { paginationHelper } from "../../../shared/pagination";
import prisma from "../../../shared/prisma";
import { uploadInSpace } from "../../../shared/UploadHelper";
import ApiError from "../../../errors/ApiErrors";

const urlGenerate = async (req: Request) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const processImages = async (files?: Express.Multer.File[]) => {
    if (!files || files.length === 0) return null;
    return Promise.all(
      files.map((file) => uploadInSpace(file, "messages/files")),
    );
  };

  const [fileUrl] = await Promise.all([processImages(files["fileUrl"])]);

  return fileUrl;
};

const getMessages = async (req: Request) => {
  const { roomId } = req.params;
  const { page, limit } = paginationHelper(req.query as any);

  const messages = await prisma.message.findMany({
    where: {
      roomId,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const messageCount = await prisma.message.count({
    where: {
      roomId,
    },
  });

  const totalPages = Math.ceil(messageCount / limit);

  return {
    messageCount,
    currentPage: page,
    totalPages,
    messages,
  };
};

const getAllChatsBetweenUsers = async () => {
  const rooms = await prisma.room.findMany({
    select: {
      id: true,
      user1: {
        select: {
          id: true,
          role: true,
          userName: true,
          profileImage: true,
        },
      },
      user2: {
        select: {
          id: true,
          role: true,
          userName: true,
          profileImage: true,
        },
      },
    },
  });

  return rooms;
};

const deleteRoom = async (roomId: string) => {
  await prisma.room.delete({
    where: {
      id: roomId,
    },
  });

  await prisma.block.deleteMany({
    where: {
      roomId,
    },
  });
  return;
};

const blockUnblockUserInDB = async (roomId: string, userId: string) => {
  const room = await prisma.room.findUniqueOrThrow({
    where: {
      id: roomId,
    },
  });

  if (room.senderId !== userId && room.receiverId !== userId) {
    throw new ApiError(400, "You are not a participant of this room");
  }

  await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      isBlocked: !room.isBlocked,
      blockerId: room.isBlocked ? null : userId,
    },
  });

  const blockedUser = await prisma.user.findUniqueOrThrow({
    where: {
      id: room.senderId === userId ? room.receiverId! : room.senderId!,
    },
  });

  if (room.isBlocked) {
    await prisma.block.deleteMany({
      where: {
        userId,
        blockedUserId: blockedUser.id,
      },
    });
  } else {
    await prisma.block.create({
      data: {
        userId,
        blockedUserId: blockedUser.id,
        name: blockedUser.fullName as string,
        profileImage: blockedUser.profileImage,
        roomId: roomId,
      },
    });
  }

  return {
    message: room.isBlocked
      ? "User unblocked successfully"
      : "User blocked successfully",
  };
};

const getBlockedUserListFromDB = async (userId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const blockList = await prisma.block.findMany({
    where: {
      userId,
    },
  });
  return blockList;
};

export const messageService = {
  urlGenerate,
  getMessages,
  getAllChatsBetweenUsers,
  deleteRoom,
  blockUnblockUserInDB,
  getBlockedUserListFromDB,
};
