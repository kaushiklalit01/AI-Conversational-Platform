import express from "express";
import connectDB from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/userRouter.js";
import messageRouter from "./routes/messageRouter.js";
import chatRouter from "./routes/chatRouter.js";
import cookieParser from "cookie-parser";


dotenv.config();

const app = express();


app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));




app.use("/user", userRouter);
app.use("/msg", messageRouter);
app.use("/chat", chatRouter);


// https://strikes.in/chat/getRecentChats
// https://strikes.in/chat/getSingleChat
// https://strikes.in/chat/deleteChat
// https://strikes.in/chat/createChat
// https://strikes.in/user/login
// https://strikes.in/user/logout
// https://strikes.in/user/signup
// https://strikes.in/user/profile


// https://strikes.in/msg/read
// https://strikes.in/msg/delete
// https://strikes.in/msg/edit



// login,signup,logout,profile: user related

// chat api:

// message banege api



const startServer = async () => {
    try {

        await connectDB();

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server has started listening at port ${PORT}`);
        });
    }
    catch (err) {
        console.log(err);
    }
};


startServer();


// server start, server listen
