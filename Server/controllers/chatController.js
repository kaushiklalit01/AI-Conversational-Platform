import Chat from "../model/chatSchema.js";
import Message from "../model/messageSchema.js";

// getRecentChat, getSingleChat, deleteChat, createChat


// req.user = user ki information hogi //last 20 chats mujhe fetch karni hai
export const getRecentChat = async (req, res) => {
    try {

        const chats = await Chat.find({ userId: req.user._id }).select("topic updatedAt").sort({ updatedAt: -1 })
            .limit(20);

        res.status(200).json({
            message: "Your all recent chats",
            chats
        });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server error"
        });
    }

};

export const getSingleChat = async (req, res) => {
    try {

        const { chatId } = req.params;

        const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });

        if (!chat) {
            return res.status(404).json({
                message: "Sorry no data found"
            });
        }

        res.status(200).json({
            chatId: chat._id,
            userId: chat.userId,
            topic: chat.topic,
            model: chat.model,
            usage: chat.usage
        });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server error"
        });
    }

};

export const createChat = async (req, res) => {
    try {

        const model = req.body.model || "openai/gpt-oss-20b";

        // model name bheja hai ye valid hai ya nahi

        const chat = await Chat.create({
            userId: req.user._id,
            model,
        });


        res.status(201).json({
            chatId: chat._id,
            userId: req.user._id,
            model,
            topic: chat.topic,
            createdAt: chat.createdAt
        });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server error"
        });
    }

};

export const deleteChat = async (req, res) => {
    try {

        const { chatId } = req.params;

        const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });

        if (!chat) {
            return res.status(403).json({
                message: "You are not allowed to do this"
            });
        }

        await Message.deleteMany({
            chatId: chat._id
        });

        await Chat.deleteOne({
            _id: chatId
        });



        res.status(200).json({
            message: "Your chat deleted successfully"
        });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server error"
        });
    }

};
