import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";

// Initialize express app
const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// In-memory token storage for secure expiring downloads
interface DownloadTokenRecord {
  token: string;
  itemId: string;
  itemType: "game" | "product";
  fileName: string;
  fileUrl: string;
  fileSize: string;
  expiresAt: number;
  userId?: string;
  customerEmail?: string;
  downloadCount: number;
  maxDownloads: number;
}

const secureDownloadTokens = new Map<string, DownloadTokenRecord>();

// Lazy Gemini API client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    genAIClient = new GoogleGenAI({ apiKey: key });
  }
  return genAIClient;
}

// 1. Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "GameHub CXT",
    timestamp: new Date().toISOString(),
    tokensActive: secureDownloadTokens.size,
  });
});

// 1.1 Dynamic XML Sitemap for Search Engines & SEO Crawlers
app.get("/sitemap.xml", (req, res) => {
  const host = req.get("host") || "gamehubcxt.io";
  const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;
  const today = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/#games</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#store</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#portfolio</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#skills</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;

  res.header("Content-Type", "application/xml");
  res.send(xml);
});

// 1.2 Robots.txt Directives Endpoint
app.get("/robots.txt", (req, res) => {
  const host = req.get("host") || "gamehubcxt.io";
  const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const robots = `# GameHub CXT Autonomous Robots Directives
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;

  res.header("Content-Type", "text/plain");
  res.send(robots);
});

// 2. AI Game Developer & Creator Assistant with Thinking Mode & Search Grounding
app.post("/api/gemini/assist", async (req, res) => {
  try {
    const { prompt, mode, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGenAI();

    // Mode 1: High Thinking Mode for complex architectural, game logic, or shader calculations
    if (mode === "thinking") {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are the GameHub CXT Master Architect and Game Engineering AI. 
Provide a deep, expert, step-by-step breakdown or code solution for the following request.
Context: ${context || "Game development, asset pipeline, digital product licensing, and platform optimization."}

Query: ${prompt}`,
              },
            ],
          },
        ],
        config: {
          thinkingConfig: {
            thinkingLevel: "HIGH" as any,
          },
        },
      });

      const text = response.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "No response generated.";
      return res.json({
        result: text,
        modelUsed: "gemini-3.1-pro-preview (Thinking: HIGH)",
      });
    }

    // Mode 2: Search Grounding for current game release data, GPU specs, engine versions
    if (mode === "search") {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Use Google Search to provide up-to-date accurate information, specs, hardware requirements, or gaming news for:
Query: ${prompt}
Context: ${context || ""}`,
              },
            ],
          },
        ],
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "No response generated.";
      const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

      return res.json({
        result: text,
        modelUsed: "gemini-3.5-flash (Google Search Grounded)",
        groundingSources: searchChunks,
        webSearchQueries: searchQueries,
      });
    }

    // Mode 3: Fast Content & Game Description Generator
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are the GameHub CXT content creator assistant.
Context: ${context || "Game and digital product marketing, changelog generation, SEO tags, specs estimation"}
Request: ${prompt}`,
            },
          ],
        },
      ],
    });

    const text = response.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "No response generated.";
    return res.json({
      result: text,
      modelUsed: "gemini-3.5-flash",
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate AI response",
    });
  }
});

// 3. Generate Secure Expiring Download Token
app.post("/api/downloads/generate-token", (req, res) => {
  const { itemId, itemType, fileName, fileUrl, fileSize, userEmail, userId } = req.body;

  if (!itemId || !fileName) {
    return res.status(400).json({ error: "Missing required item parameters" });
  }

  // Generate unique cryptographically secure token
  const token = crypto.randomBytes(24).toString("hex");
  const expiresInMinutes = 30;
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

  const record: DownloadTokenRecord = {
    token,
    itemId,
    itemType: itemType || "game",
    fileName,
    fileUrl: fileUrl || `https://storage.gamehubcxt.io/files/${encodeURIComponent(fileName)}`,
    fileSize: fileSize || "1.2 GB",
    expiresAt,
    userId,
    customerEmail: userEmail,
    downloadCount: 0,
    maxDownloads: 5,
  };

  secureDownloadTokens.set(token, record);

  // Clean up old expired tokens
  const now = Date.now();
  for (const [key, val] of secureDownloadTokens.entries()) {
    if (val.expiresAt < now) {
      secureDownloadTokens.delete(key);
    }
  }

  res.json({
    success: true,
    token,
    expiresAt,
    expiresInMinutes,
    downloadUrl: `/api/downloads/file/${token}`,
  });
});

// 4. Secure File Access & Verification
app.get("/api/downloads/verify/:token", (req, res) => {
  const { token } = req.params;
  const record = secureDownloadTokens.get(token);

  if (!record) {
    return res.status(404).json({
      valid: false,
      message: "Download link has expired or is invalid. Please request a new link.",
    });
  }

  if (Date.now() > record.expiresAt) {
    secureDownloadTokens.delete(token);
    return res.status(410).json({
      valid: false,
      message: "Download link expired. Please regenerate your download token.",
    });
  }

  if (record.downloadCount >= record.maxDownloads) {
    return res.status(429).json({
      valid: false,
      message: `Download limit (${record.maxDownloads} attempts) exceeded for this token.`,
    });
  }

  res.json({
    valid: true,
    fileName: record.fileName,
    fileSize: record.fileSize,
    itemType: record.itemType,
    remainingMinutes: Math.max(0, Math.round((record.expiresAt - Date.now()) / 60000)),
    downloadsRemaining: record.maxDownloads - record.downloadCount,
  });
});

// 5. Trigger Secure File Download Stream/Simulation
app.get("/api/downloads/file/:token", (req, res) => {
  const { token } = req.params;
  const record = secureDownloadTokens.get(token);

  if (!record || Date.now() > record.expiresAt) {
    return res.status(410).send(`
      <html>
        <body style="background:#090d16;color:#fff;font-family:sans-serif;text-align:center;padding:50px;">
          <h2>⚠️ Download Link Expired or Invalid</h2>
          <p>This secure link has expired or has already been used. Please return to GameHub CXT to generate a fresh download token.</p>
          <a href="/" style="color:#00f0ff;text-decoration:none;">Back to GameHub CXT</a>
        </body>
      </html>
    `);
  }

  record.downloadCount += 1;

  // Stream sample payload or provide file download header
  res.setHeader("Content-Disposition", `attachment; filename="${record.fileName}"`);
  res.setHeader("Content-Type", "application/octet-stream");
  res.send(`GameHub CXT Package: ${record.fileName}\nItem ID: ${record.itemId}\nSize: ${record.fileSize}\nTimestamp: ${new Date().toISOString()}\nLicense: Secure Verified Download Key\n\n[Protected game data package content initialized successfully]`);
});

// 6. Discord Webhook notification dispatcher & simulator
app.post("/api/discord/webhook", async (req, res) => {
  const { webhookUrl, event, title, description, fields, color } = req.body;

  const discordPayload = {
    embeds: [
      {
        title: title || `🎮 GameHub CXT Alert: ${event}`,
        description: description || "A new event occurred on GameHub CXT",
        color: color || 0x00f0ff,
        fields: fields || [],
        footer: {
          text: "GameHub CXT • Automated Notification Engine",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  if (webhookUrl && webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordPayload),
      });
      return res.json({ success: response.ok, status: response.status });
    } catch (err: any) {
      console.warn("Discord webhook delivery failed:", err.message);
      return res.json({ success: false, simulated: true, message: err.message, payload: discordPayload });
    }
  }

  // Return simulated success
  res.json({
    success: true,
    simulated: true,
    message: "Discord notification payload generated and logged.",
    payload: discordPayload,
  });
});

// Start Express Server with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[GameHub CXT Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
