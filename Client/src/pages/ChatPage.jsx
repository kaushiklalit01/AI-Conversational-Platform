import { useEffect, useState } from "react";
import { useChat } from "../context/ChatContext";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import { Menu } from "lucide-react";

const ChatPage = () => {
  const { fetchRecentChats } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchRecentChats();
  }, [fetchRecentChats]);

  return (
    <div className="h-screen flex bg-gray-900 text-white overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center p-3 border-b border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 font-semibold">ChatGPT</span>
        </div>

        <ChatArea />
      </div>
    </div>
  );
};

export default ChatPage;
