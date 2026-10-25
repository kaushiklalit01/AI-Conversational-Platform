import express from "express";
import authUserMiddleware from "../middlewares/authUserMiddleware.js";
import { getRecentChat, getSingleChat, createChat, deleteChat } from "../controllers/chatController.js";

const chatRouter = express.Router();


chatRouter.use(authUserMiddleware);

// getRecentChats: top 20, getSingleChat, deleteChat

chatRouter.post("/createChat", createChat);
chatRouter.get("/getRecentChats", getRecentChat);
chatRouter.get("/:chatId", getSingleChat);
chatRouter.delete("/:chatId", deleteChat);

export default chatRouter;
