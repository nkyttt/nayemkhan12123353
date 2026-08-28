import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  Sparkles,
  Bot,
  Send,
  X,
  Cpu,
  BrainCircuit,
  Search,
  Zap,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { requestGeminiAssistance } from "../services/geminiService";

export const GeminiAIAssistant: React.FC = () => {
  const { isAiAssistantOpen, setIsAiAssistantOpen, games, products } = useApp();

  const [prompt, setPrompt] = useState("");
  const [aiMode, setAiMode] = useState<"general" | "thinking" | "search">("thinking");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string; thoughtProcess?: string }>
  >([
    {
      role: "assistant",
      content:
        "Hello! I am your **GameHub CXT AI Intelligence Assistant**. I can recommend indie games, evaluate your hardware system requirements, or suggest the best game development assets for your studio projects.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isAiAssistantOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { role: "user" as const, content: textToSend }];
    setMessages(newMessages);
    setPrompt("");
    setLoading(true);

    try {
      // Build context of available games and assets for grounded recommendations
      const systemContext = `
You are the expert GameHub CXT AI Assistant.
Available Games in Vault: ${games.map((g) => `${g.title} (${g.category}, ${g.fileSize}, Price: $${g.price}, Min Specs: ${g.minGpu})`).join("; ")}.
Available Store Assets: ${products.map((p) => `${p.title} (${p.category}, $${p.price})`).join("; ")}.
Be helpful, precise, technical, and enthusiastic about gaming and game engineering.
      `;

      const response = await requestGeminiAssistance(textToSend, aiMode, systemContext);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.result || "No response received.",
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error executing AI query: ${err.message || "Please check backend connection."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Recommend top RPGs with low GPU requirements",
    "Can my PC run Neon Shadow with 16GB RAM and GTX 1060?",
    "What shader and UI assets are best for an Unreal Engine 5 project?",
  ];

  return (
    <div
      id="ai-assistant-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="bg-[#0e1526] border border-cyan-500/50 rounded-3xl max-w-2xl w-full h-[85vh] shadow-2xl flex flex-col justify-between overflow-hidden relative font-mono">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#090d16] border-b border-cyan-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase">GameHub CXT AI Intelligence</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                  Gemini Powered
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Deep Reasoning & Game Discovery</span>
            </div>
          </div>

          <button
            onClick={() => setIsAiAssistantOpen(false)}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Mode Selector */}
        <div className="px-5 py-2.5 bg-[#0b101c] border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Mode:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAiMode("thinking")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                aiMode === "thinking"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🧠 Deep Reasoning
            </button>
            <button
              onClick={() => setAiMode("search")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                aiMode === "search"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🌐 Grounded Search
            </button>
            <button
              onClick={() => setAiMode("general")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                aiMode === "general"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ⚡ Fast Assist
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-[80%] space-y-2 ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md font-sans"
                    : "bg-[#090d16] border border-cyan-950 text-slate-200"
                }`}
              >
                {/* Optional Thought Process Accordion */}
                {msg.thoughtProcess && (
                  <details className="mb-2 p-2 rounded-lg bg-slate-900 border border-cyan-900/40 text-[11px] text-cyan-300">
                    <summary className="cursor-pointer font-bold flex items-center gap-1">
                      <BrainCircuit className="w-3 h-3" /> View AI Thought Chain
                    </summary>
                    <p className="mt-2 text-slate-400 whitespace-pre-wrap">{msg.thoughtProcess}</p>
                  </details>
                )}

                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#090d16] border border-cyan-950 text-cyan-300 text-xs flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Analyzing specs and synthesizing recommendation...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-5 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {samplePrompts.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sp)}
              className="px-3 py-1 rounded-full bg-[#090d16] border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 text-[11px] whitespace-nowrap"
            >
              {sp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#090d16] border-t border-cyan-950 flex items-center gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about game specs, downloads, or studio assets..."
            className="flex-1 px-4 py-3 rounded-2xl bg-[#0d1322] border border-cyan-900/40 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !prompt.trim()}
            className="p-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
