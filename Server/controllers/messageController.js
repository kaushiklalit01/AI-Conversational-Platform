import Message from "../model/messageSchema.js";
import Chat from "../model/chatSchema.js";
import User from "../model/userSchema.js";
import { generateAIResponse } from "../services/aiService.js";

// Send a message and get AI response
export const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;

    if (!chatId || !content || !content.trim()) {
      return res.status(400).json({
        message: "chatId and message content are required",
      });
    }

    // Verify chat ownership
    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    // Check token limits
    const currentUser = await User.findById(req.user._id);
    if (currentUser?.usage?.tokenUsed >= (currentUser?.usage?.tokenLimit || 10000)) {
      return res.status(403).json({
        message: "Token limit reached. Please wait for reset.",
      });
    }

    // 1. Save user message to database
    const userMessage = await Message.create({
      userId: req.user._id,
      chatId: chat._id,
      role: "user",
      content: content.trim(),
    });

    // 2. Fetch recent conversation history for AI context (up to 15 messages)
    const history = await Message.find({ chatId: chat._id })
      .sort({ createdAt: 1 })
      .limit(15);

    const messagesForAI = history.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 3. Call AI Service
    let aiResponse;
    try {
      aiResponse = await generateAIResponse(messagesForAI, chat.model);
    } catch (aiErr) {
      console.error("AI Generation Error:", aiErr);
      return res.status(502).json({
        message: aiErr.message || "Failed to generate AI response",
      });
    }

    // 4. Save assistant response to database
    const assistantMessage = await Message.create({
      userId: req.user._id,
      chatId: chat._id,
      role: "assistant",
      content: aiResponse.content,
      tokens: aiResponse.usage.totalTokens,
      usage: aiResponse.usage,
    });

    // 5. Update Chat (messageCount, tokens, topic if New Chat)
    chat.messageCount += 2;
    chat.usage.promptTokens += aiResponse.usage.promptTokens;
    chat.usage.completionTokens += aiResponse.usage.completionTokens;
    chat.usage.totalTokens += aiResponse.usage.totalTokens;

    if (chat.topic === "New Chat") {
      // Create concise topic from first message
      const cleanPrompt = content.trim().replace(/\n/g, " ");
      chat.topic = cleanPrompt.length > 28 ? cleanPrompt.substring(0, 28) + "..." : cleanPrompt;
    }

    await chat.save();

    // 6. Update User usage stats
    if (currentUser) {
      currentUser.usage.tokenUsed = (currentUser.usage.tokenUsed || 0) + aiResponse.usage.totalTokens;
      currentUser.usage.totalTokenUsed = (currentUser.usage.totalTokenUsed || 0) + aiResponse.usage.totalTokens;
      await currentUser.save();
    }

    return res.status(200).json({
      userMessage,
      assistantMessage,
      topic: chat.topic,
      usage: currentUser ? currentUser.usage : null,
    });
  } catch (err) {
    console.error("sendMessage error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Get all messages for a specific chat
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({ message: "chatId is required" });
    }

    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const messages = await Message.find({ chatId, userId: req.user._id }).sort({ createdAt: 1 });

    return res.status(200).json({
      messages,
    });
  } catch (err) {
    console.error("getMessages error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Delete a specific message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOneAndDelete({
      _id: messageId,
      userId: req.user._id,
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    return res.status(200).json({
      message: "Message deleted successfully",
    });
  } catch (err) {
    console.error("deleteMessage error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
