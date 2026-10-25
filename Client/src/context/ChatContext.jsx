import { createContext, useContext, useState, useCallback } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { updateUsage } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchRecentChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      const res = await api.get("/chat/getRecentChats");
      setChats(res.data.chats || []);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const createChat = useCallback(async (model = "openai/gpt-oss-20b") => {
    try {
      const res = await api.post("/chat/createChat", { model });
      const newChat = {
        _id: res.data.chatId,
        topic: res.data.topic,
        model: res.data.model,
        updatedAt: res.data.createdAt,
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChat(newChat);
      setMessages([]);
      return newChat;
    } catch (err) {
      console.error("Failed to create chat:", err);
      throw err;
    }
  }, []);

  const selectChat = useCallback(async (chatId) => {
    setLoadingMessages(true);
    try {
      const chatRes = await api.get(`/chat/${chatId}`);
      setActiveChat({
        _id: chatRes.data.chatId,
        topic: chatRes.data.topic,
        model: chatRes.data.model,
        usage: chatRes.data.usage,
      });

      // Load conversation messages from backend
      const msgRes = await api.get(`/msg/${chatId}`);
      setMessages(msgRes.data.messages || []);
    } catch (err) {
      console.error("Failed to select chat:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const deleteChat = useCallback(
    async (chatId) => {
      try {
        await api.delete(`/chat/${chatId}`);
        setChats((prev) => prev.filter((c) => c._id !== chatId));
        if (activeChat?._id === chatId) {
          setActiveChat(null);
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to delete chat:", err);
        throw err;
      }
    },
    [activeChat]
  );

  const sendMessage = useCallback(
    async (content) => {
      let currentChat = activeChat;

      // If no active chat, create one first
      if (!currentChat) {
        currentChat = await createChat("openai/gpt-oss-20b");
      }

      const userMsg = {
        _id: "temp-user-" + Date.now(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      const loadingMsg = {
        _id: "temp-loading-" + Date.now(),
        role: "assistant",
        content: "Thinking...",
        createdAt: new Date().toISOString(),
        loading: true,
      };

      // Add user message & loading indicator to state immediately
      setMessages((prev) => [...prev, userMsg, loadingMsg]);

      try {
        const res = await api.post("/msg/send", {
          chatId: currentChat._id,
          content,
        });

        // Replace loading message with actual AI response
        setMessages((prev) => {
          const filtered = prev.filter((m) => !m.loading && m._id !== userMsg._id);
          return [
            ...filtered,
            res.data.userMessage || userMsg,
            res.data.assistantMessage,
          ];
        });

        // Update active chat topic if modified
        if (res.data.topic) {
          setActiveChat((prev) => (prev ? { ...prev, topic: res.data.topic } : prev));
          setChats((prev) =>
            prev.map((c) =>
              c._id === currentChat._id ? { ...c, topic: res.data.topic } : c
            )
          );
        }

        // Update token usage counter
        if (res.data.usage) {
          updateUsage(res.data.usage);
        }

        return res.data;
      } catch (err) {
        console.error("Failed to send message:", err);
        // Replace loading message with an error bubble
        setMessages((prev) => {
          const filtered = prev.filter((m) => !m.loading);
          return [
            ...filtered,
            {
              _id: "error-" + Date.now(),
              role: "assistant",
              content: `⚠️ Error: ${
                err.response?.data?.message || err.message || "Failed to generate AI response"
              }`,
              createdAt: new Date().toISOString(),
            },
          ];
        });
        throw err;
      }
    },
    [activeChat, createChat, updateUsage]
  );

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        messages,
        loadingChats,
        loadingMessages,
        fetchRecentChats,
        createChat,
        selectChat,
        deleteChat,
        sendMessage,
        setActiveChat,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
