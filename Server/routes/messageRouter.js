import express from "express";
import authUserMiddleware from "../middlewares/authUserMiddleware.js";
import {
  sendMessage,
  getMessages,
  deleteMessage,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.use(authUserMiddleware);

messageRouter.post("/send", sendMessage);
messageRouter.get("/:chatId", getMessages);
messageRouter.delete("/:messageId", deleteMessage);

export default messageRouter;
