export const generateAIResponse = async (messages, modelName = "openai/gpt-oss-20b") => {
  const apiKey = process.env.GROQ_API_KEY || process.env.OPEN_ROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("AI API key is missing in environment variables");
  }

  const isGroq = apiKey.startsWith("gsk_");
  const url = isGroq
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://openrouter.ai/api/v1/chat/completions";

  // Default to a working model for Groq
  let model = modelName;
  if (isGroq && (!model || model.includes("gpt-3.5") || model.includes("gpt-4") || model === "New Chat")) {
    model = "openai/gpt-oss-20b";
  }

  const formattedMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  if (!isGroq) {
    headers["HTTP-Referer"] = "http://localhost:5173";
    headers["X-Title"] = "ChatGPT Clone";
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: formattedMessages,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.error?.message || `AI service returned error ${response.status}`;
    throw new Error(errorMsg);
  }

  const choice = data.choices?.[0];
  const reply = choice?.message?.content || "No response generated.";
  const usage = data.usage || {};

  return {
    content: reply,
    usage: {
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
    },
  };
};
