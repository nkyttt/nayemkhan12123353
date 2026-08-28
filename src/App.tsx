import React, { useEffect, useRef } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { GamesCatalog } from "./components/GamesCatalog";
import { GameDetailPage } from "./components/GameDetailPage";
import { StoreCatalog } from "./components/StoreCatalog";
import { PortfolioView } from "./components/PortfolioView";
import { UserDashboard } from "./components/UserDashboard";
import { CreatorDashboard } from "./components/CreatorDashboard";
import { AdminPanel } from "./components/AdminPanel/AdminPanel";
import { CartAndCheckoutModal } from "./components/CartAndCheckoutModal";
import { GeminiAIAssistant } from "./components/GeminiAIAssistant";
import { Footer } from "./components/Footer";
import { AlertTriangle, X, Sparkles, CheckCircle2, Info, Shield } from "lucide-react";

const MainAppContent: React.FC = () => {
  const { activeView, siteConfig, notifications, removeNotification, setActiveView } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamic Document Title and SEO / OpenGraph / Schema Meta Tags Syncer
  useEffect(() => {
    // 1. Title
    if (siteConfig.seoTitle) {
      document.title = siteConfig.seoTitle;
    } else if (siteConfig.siteName) {
      document.title = `${siteConfig.siteName} | Game Hosting & Digital Assets`;
    }

    // 2. Helper to set/update meta tag
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? `property="${name}"` : `name="${name}"`;
      let meta = document.querySelector(`meta[${attr}]`);
      if (!meta) {
        meta = document.createElement("meta");
        if (isProperty) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateMetaTag("description", siteConfig.seoDescription || siteConfig.siteTagline);
    updateMetaTag("keywords", siteConfig.seoKeywords || "games, indie game downloads, game source code, shaders");
    updateMetaTag("author", siteConfig.authorName || siteConfig.siteName);
    updateMetaTag("robots", `${siteConfig.robotsIndex !== false ? "index" : "noindex"}, ${siteConfig.robotsFollow !== false ? "follow" : "nofollow"}`);

    // OpenGraph
    updateMetaTag("og:title", siteConfig.ogTitle || siteConfig.seoTitle || siteConfig.siteName, true);
    updateMetaTag("og:description", siteConfig.ogDescription || siteConfig.seoDescription || siteConfig.siteTagline, true);
    updateMetaTag("og:type", siteConfig.ogType || "website", true);
    updateMetaTag("og:image", siteConfig.ogImageUrl || siteConfig.fallbackImageUrl || siteConfig.logoUrl, true);
    updateMetaTag("og:url", siteConfig.canonicalUrl || window.location.origin, true);

    // Twitter Card
    updateMetaTag("twitter:card", siteConfig.twitterCard || "summary_large_image");
    updateMetaTag("twitter:creator", siteConfig.twitterCreator || "@gamehubcxt");
    updateMetaTag("twitter:title", siteConfig.ogTitle || siteConfig.seoTitle || siteConfig.siteName);
    updateMetaTag("twitter:description", siteConfig.ogDescription || siteConfig.seoDescription || siteConfig.siteTagline);
    updateMetaTag("twitter:image", siteConfig.ogImageUrl || siteConfig.fallbackImageUrl || siteConfig.logoUrl);

    // JSON-LD Structured Data
    if (siteConfig.enableJsonLd !== false) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": siteConfig.canonicalUrl || window.location.origin,
        "name": siteConfig.siteName || "GameHub CXT",
        "description": siteConfig.seoDescription || siteConfig.siteTagline,
        "publisher": {
          "@type": "Organization",
          "name": siteConfig.authorName || siteConfig.siteName,
          "logo": {
            "@type": "ImageObject",
            "url": siteConfig.logoUrl,
          },
        },
      });
    }
  }, [siteConfig]);

  // Dynamic Matrix Grid Animation for Video Background fallback/preset
  useEffect(() => {
    if (!siteConfig.showVideoBg || siteConfig.videoBgType !== "matrixGrid") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: Array<{ x: number; y: number; speed: number; char: string; size: number }> = [];
    const chars = "010101CXTGAMEHUB8899ΑΒΓΔEZH";

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.5 + Math.random() * 1.5,
        char: chars.charAt(Math.floor(Math.random() * chars.length)),
        size: 10 + Math.random() * 8,
      });
    }

    const render = () => {
      ctx.fillStyle = "rgba(7, 11, 18, 0.2)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = siteConfig.primaryColor || "#00F0FF";
      ctx.font = "12px monospace";

      particles.forEach((p) => {
        ctx.fillText(p.char, p.x, p.y);
        p.y += p.speed;
        if (p.y > height) {
          p.y = 0;
          p.x = Math.random() * width;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [siteConfig.showVideoBg, siteConfig.videoBgType, siteConfig.primaryColor]);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500 selection:text-black overflow-x-hidden">
      {/* Immersive UI Ambient Glowing Atmospheric Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-orange-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      {/* 1. Global Dynamic Video / Canvas Background */}
      {siteConfig.showVideoBg && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {siteConfig.videoBgType === "mp4" && siteConfig.videoBgUrl ? (
            <video
              src={siteConfig.videoBgUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover filter"
              style={{ filter: `blur(${siteConfig.videoBlur || 0}px)` }}
            />
          ) : siteConfig.videoBgType === "matrixGrid" ? (
            <canvas ref={canvasRef} className="w-full h-full opacity-60" />
          ) : (
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-950/20 via-[#050505] to-[#050505]" />
          )}

          {/* Configurable Dark Overlay */}
          <div
            className="absolute inset-0 bg-[#050505]"
            style={{ opacity: siteConfig.videoOverlayOpacity ?? 0.7 }}
          />
        </div>
      )}

      {/* 2. Top Navigation Bar */}
      <Navbar />

      {/* 3. Maintenance Mode Alert (if active) */}
      {siteConfig.maintenanceMode && activeView !== "admin" && (
        <div className="relative z-30 bg-orange-500/10 border-b border-orange-500/30 p-3 text-center text-orange-300 text-xs font-mono flex items-center justify-center gap-2 backdrop-blur-md">
          <AlertTriangle className="w-4 h-4 text-orange-400 animate-bounce" />
          <span>
            <strong>MAINTENANCE NOTICE:</strong> {siteConfig.maintenanceMessage}
          </span>
          <button
            onClick={() => setActiveView("admin")}
            className="ml-3 underline hover:text-white font-bold"
          >
            Admin Bypass
          </button>
        </div>
      )}

      {/* 4. Active Main View Content */}
      <main className="relative z-10">
        {activeView === "home" && (
          <div>
            <HeroSection />
            <GamesCatalog limit={6} showTitle={true} />
            <StoreCatalog limit={6} showTitle={true} />
            <PortfolioView />
          </div>
        )}

        {activeView === "games" && <GamesCatalog showTitle={true} />}
        {activeView === "game-detail" && <GameDetailPage />}
        {activeView === "store" && <StoreCatalog showTitle={true} />}
        {activeView === "portfolio" && <PortfolioView />}
        {activeView === "user-dashboard" && <UserDashboard />}
        {activeView === "creator-dashboard" && <CreatorDashboard />}
        {activeView === "admin" && <AdminPanel />}
      </main>

      {/* 5. Modals & Overlays */}
      <CartAndCheckoutModal />
      <GeminiAIAssistant />

      {/* 6. Notification Toasts Bar */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="p-4 rounded-2xl bg-black/85 border border-white/10 text-white shadow-[0_0_25px_rgba(249,115,22,0.25)] backdrop-blur-xl pointer-events-auto flex items-start justify-between gap-3 animate-in slide-in-from-right font-mono text-xs"
          >
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-white uppercase tracking-wider">{n.title}</h5>
                <p className="text-white/60 mt-0.5 text-[11px] leading-tight">{n.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* 7. Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
