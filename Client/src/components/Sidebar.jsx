import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import toast from "react-hot-toast";
import {
  Plus,
  MessageSquare,
  Trash2,
  LogOut,
  X,
  User,
  Zap,
} from "lucide-react";

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const { chats, activeChat, createChat, selectChat, deleteChat, loadingChats } =
    useChat();
  const [deletingId, setDeletingId] = useState(null);

  const handleNewChat = async () => {
    try {
      await createChat();
      onClose?.();
    } catch {
      toast.error("Failed to create chat");
    }
  };

  const handleSelectChat = async (chatId) => {
    await selectChat(chatId);
    onClose?.();
  };

  const handleDelete = async (e, chatId) => {
    e.stopPropagation();
    setDeletingId(chatId);
    try {
      await deleteChat(chatId);
      toast.success("Chat deleted");
    } catch {
      toast.error("Failed to delete chat");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed");
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full bg-gray-950 flex flex-col border-r border-gray-800">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">ChatGPT</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New chat button */}
      <div className="px-3 mb-2">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors border border-gray-700 hover:border-gray-600"
        >
          <Plus className="w-5 h-5 text-emerald-400" />
          <span className="font-medium">New Chat</span>
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {loadingChats ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => handleSelectChat(chat._id)}
              className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                activeChat?._id === chat._id
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{chat.topic}</p>
                <p className="text-xs text-gray-500 truncate">
                  {formatDate(chat.updatedAt)}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(e, chat._id)}
                disabled={deletingId === chat._id}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
              >
                {deletingId === chat._id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border border-red-400 border-t-transparent" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </button>
          ))
        )}
      </div>

      {/* User info / footer */}
      <div className="p-3 border-t border-gray-800">
        {/* Token usage */}
        {user?.usage && (
          <div className="mb-3 px-3 py-2 bg-gray-900 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Token Usage</span>
            </div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    ((user.usage.tokenUsed || 0) / (user.usage.tokenLimit || 10000)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {(user.usage.tokenUsed || 0).toLocaleString()} /{" "}
              {(user.usage.tokenLimit || 10000).toLocaleString()}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-red-400"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
