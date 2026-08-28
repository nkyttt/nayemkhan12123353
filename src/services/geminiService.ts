export interface GeminiAssistResponse {
  result: string;
  modelUsed?: string;
  groundingSources?: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
  webSearchQueries?: string[];
  error?: string;
}

export async function requestGeminiAssistance(
  prompt: string,
  mode: "thinking" | "search" | "general" = "general",
  context?: string
): Promise<GeminiAssistResponse> {
  try {
    const res = await fetch("/api/gemini/assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, mode, context }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.error("Gemini assistance request failed:", error);
    return {
      result: `⚠️ AI Assistant temporarily unavailable: ${error.message}`,
      error: error.message,
    };
  }
}
