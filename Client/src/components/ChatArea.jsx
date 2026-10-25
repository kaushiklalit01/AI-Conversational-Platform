import { useState, useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import MessageBubble from "./MessageBubble";
import { Send, Sparkles, MessageSquare, Code, BookOpen, Lightbulb } from "lucide-react";
import toast from "react-hot-toast";

const ChatArea = () => {
  const { activeChat, messages, sendMessage, loadingMessages } = useChat();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingMessages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setSending(true);

    try {
      await sendMessage(trimmed);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    {
      icon: <Code className="w-5 h-5 text-blue-400" />,
      title: "Write code",
      desc: "Help me write a React component with Tailwind",
    },
    {
      icon: <BookOpen className="w-5 h-5 text-purple-400" />,
      title: "Explain a concept",
      desc: "Explain how large language models work in simple terms",
    },
    {
      icon: <Lightbulb className="w-5 h-5 text-amber-400" />,
      title: "Brainstorm ideas",
      desc: "Give me 5 unique project ideas using AI and APIs",
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
      title: "Draft content",
      desc: "Write a polite follow-up email after a job interview",
    },
  ];

  // Empty state — no active chat and no messages
  if (!activeChat && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20 overflow-y-auto">
          <div className="w-16 h-16 bg-emerald-600/20 rounded-2xl flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 text-center">How can I help you today?</h2>
          <p className="text-gray-400 text-center max-w-md mb-10">
            Ask me anything — coding questions, explanations, brainstorming, or creative writing.
          </p>

          {/* Suggestion cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(s.desc);
                  textareaRef.current?.focus();
                }}
                className="flex items-start gap-3 p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl text-left transition-all group"
              >
                <div className="mt-0.5">{s.icon}</div>
                <div>
                  <p className="font-medium text-gray-200 group-hover:text-white transition-colors">
                    {s.title}
                  </p>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input bar */}
        <div className="px-4 pb-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 bg-gray-800 border border-gray-700 rounded-2xl p-3 focus-within:border-emerald-500/50 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none max-h-[200px] py-1.5 px-1"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl transition-colors shrink-0"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-center text-xs text-gray-600 mt-3">
              AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active chat view with messages
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Chat header */}
      <div className="hidden lg:flex items-center px-6 py-3 border-b border-gray-800 bg-gray-900/60 backdrop-blur-sm">
        <h2 className="font-semibold truncate text-gray-200">{activeChat?.topic || "New Chat"}</h2>
        {activeChat?.model && (
          <span className="ml-3 text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full border border-gray-700">
            {activeChat.model}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {loadingMessages ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
            </div>
          ) : (
            messages.map((msg, i) => <MessageBubble key={msg._id || i} message={msg} />)
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="px-4 pb-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-gray-800 border border-gray-700 rounded-2xl p-3 focus-within:border-emerald-500/50 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              rows={1}
              className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none max-h-[200px] py-1.5 px-1"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl transition-colors shrink-0"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-center text-xs text-gray-600 mt-3">
            AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
