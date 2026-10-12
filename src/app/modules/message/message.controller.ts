import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { messageService } from "./message.service";

const generateFileUrl = catchAsync(async (req, res) => {
  const fileUrl = await messageService.urlGenerate(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "File URL generated successfully",
    data: fileUrl,
  });
});

const getMessages = catchAsync(async (req, res) => {
  const messages = await messageService.getMessages(req);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Messages retrived successfully",
    data: messages,
  });
});
const getChats = catchAsync(async (req, res) => {
  const messages = await messageService.getAllChatsBetweenUsers();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Chats retrived successfully",
    data: messages,
  });
});
const deleteRoom = catchAsync(async (req, res) => {
  const roomId = req.params.id;
  await messageService.deleteRoom(roomId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Chat deleted successfully",
  });
});
const blockUnblockuser = catchAsync(async (req, res) => {
  const roomId = req.params.id;
  const userId = req.user?.id;
  const result = await messageService.blockUnblockUserInDB(roomId, userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: result.message,
  });
});
const blockList = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  const result = await messageService.getBlockedUserListFromDB(userId);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Blocked user list retrieved successfully",
    data: result,
  });
});

export const messageControllers = {
  generateFileUrl,
  getMessages,
  getChats,
  deleteRoom,
  blockUnblockuser,
  blockList,
};
