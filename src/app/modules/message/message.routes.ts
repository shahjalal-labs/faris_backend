import express from "express";
import { messageControllers } from "./message.controller";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../../helpers/fileUploadHelper";


const router = express.Router();

router.post(
  "/generate-url",
  fileUploader.uploadMultiple,
  messageControllers.generateFileUrl
);
router.get("/:roomId", auth(), messageControllers.getMessages);
router.delete("/:id", messageControllers.deleteRoom);
router.get("/chats/admin", messageControllers.getChats);
router.get("/block/list", auth(), messageControllers.blockList);
router.patch("/block-unblock/:id", auth(), messageControllers.blockUnblockuser);

export const messageRoute = router;
