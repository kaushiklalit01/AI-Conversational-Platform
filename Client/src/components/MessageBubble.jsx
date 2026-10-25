import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Sparkles, Copy, Check } from "lucide-react";
import { useState } from "react";

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-4 ${isUser ? "" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
          isUser
            ? "bg-blue-600"
            : "bg-emerald-600"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0 group">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-300">
            {isUser ? "You" : "Assistant"}
          </span>
          {message.createdAt && (
            <span className="text-xs text-gray-600">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <div
          className={`prose prose-invert max-w-none ${
            message.loading ? "typing-cursor" : ""
          }`}
        >
          {isUser ? (
            <p className="text-gray-200 whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-body text-gray-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isUser && !message.loading && (
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
