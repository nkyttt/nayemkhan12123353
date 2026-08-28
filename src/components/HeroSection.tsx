import React, { useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Gamepad2, Store, Sparkles, Download, ShieldCheck, Cpu, Play, Terminal } from "lucide-react";

export const HeroSection: React.FC = () => {
  const { siteConfig, setActiveView, setIsAiModalOpen } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = siteConfig.videoSpeed || 1;
    }
  }, [siteConfig.videoSpeed, siteConfig.videoBgUrl]);

  // Cyber Matrix Grid animation fallback when video type is matrixGrid
  useEffect(() => {
    if (siteConfig.videoBgType !== "matrixGrid" && siteConfig.showVideoBg) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const cols = Math.floor(width / 20);
    const ypos = Array(cols).fill(0);

    const matrix = () => {
      ctx.fillStyle = "rgba(9, 13, 22, 0.1)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = siteConfig.primaryColor || "#00F0FF";
      ctx.font = "12pt monospace";

      ypos.forEach((y, ind) => {
        const text = String.fromCharCode(Math.floor(Math.random() * 128));
        const x = ind * 20;
        ctx.fillText(text, x, y);
        if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
        else ypos[ind] = y + 20;
      });

      animationFrameId = requestAnimationFrame(matrix);
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    matrix();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [siteConfig.videoBgType, siteConfig.showVideoBg, siteConfig.primaryColor]);

  return (
    <section
      id="hero-section-wrapper"
      className="relative pt-8 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      {/* 1. Immersive Hero Banner Card */}
      <div className="relative min-h-[460px] sm:min-h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group flex flex-col justify-center">
        {/* Background media */}
        {siteConfig.showVideoBg && siteConfig.videoBgType === "mp4" ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster={siteConfig.fallbackImageUrl}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            style={{ filter: `blur(${siteConfig.videoBlur || 0}px)` }}
          >
            <source src={siteConfig.videoBgUrl} type="video/mp4" />
          </video>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-1000"
            style={{ backgroundImage: `url(${siteConfig.fallbackImageUrl})` }}
          />
        )}

        {/* Gradient scrim overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10" />

        {/* Content Container */}
        <div className="relative z-20 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 gap-5 max-w-3xl">
          {/* Live Leak / Deployment Pulse Pill */}
          <div className="inline-flex items-center gap-2 bg-orange-600 text-black px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter w-fit shadow-[0_0_15px_rgba(234,88,12,0.5)]">
            <span className="animate-pulse text-xs">●</span> Live Encrypted Infrastructure: v2.4.0
          </div>

          {/* Display Headline */}
          <h1
            id="hero-main-heading"
            className="text-4xl sm:text-6xl lg:text-7xl font-black italic tracking-tighter leading-none uppercase text-white"
          >
            {siteConfig.heroHeading ? (
              siteConfig.heroHeading.includes(" ") ? (
                <>
                  {siteConfig.heroHeading.split(" ").slice(0, -1).join(" ")}<br />
                  <span className="text-orange-500">{siteConfig.heroHeading.split(" ").slice(-1)[0]}</span>
                </>
              ) : (
                <span className="text-orange-500">{siteConfig.heroHeading}</span>
              )
            ) : (
              <>
                CYBER<br />
                <span className="text-orange-500">PROTOCOL</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p
            id="hero-subtitle"
            className="text-white/70 text-sm sm:text-base leading-relaxed max-w-xl font-normal"
          >
            {siteConfig.heroSubtitle ||
              "Secure the latest source files, engine assets, and internal documentation for next-generation releases. Managed via the L33K encrypted backbone."}
          </p>

          {/* Action Button Strip */}
          <div id="hero-cta-buttons" className="flex flex-wrap gap-4 mt-2">
            <button
              id="hero-cta-primary-btn"
              onClick={() => setActiveView("games")}
              className="px-8 py-3.5 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{siteConfig.heroBtnPrimaryText || "DOWNLOAD FILES"}</span>
            </button>

            <button
              id="hero-cta-secondary-btn"
              onClick={() => setActiveView("store")}
              className="px-8 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>{siteConfig.heroBtnSecondaryText || "CREATOR STORE"}</span>
            </button>

            <button
              id="hero-cta-ai-btn"
              onClick={() => setIsAiModalOpen(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black uppercase text-xs tracking-widest transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>AI ASST</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. System Metrics & Quick Highlights 3-Column Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Highlight 1: Store Highlights */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col backdrop-blur-md hover:border-orange-500/30 transition-all">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xs font-black tracking-widest text-white/40 uppercase">STORE HIGHLIGHTS</h3>
            <button onClick={() => setActiveView("store")} className="text-[10px] text-orange-500 hover:underline uppercase font-bold tracking-wider">
              VIEW ALL
            </button>
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center shrink-0 text-orange-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">UE5 Plugin: Physics X</p>
                <p className="text-[10px] text-white/40 font-mono">$29.99 • Commercial License</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center shrink-0 text-orange-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">Next.js Game Hub Kit</p>
                <p className="text-[10px] text-white/40 font-mono">FREE • Open Source</p>
              </div>
            </div>
          </div>
        </div>

        {/* Highlight 2: System Metrics */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col backdrop-blur-md hover:border-orange-500/30 transition-all">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xs font-black tracking-widest text-white/40 uppercase">SYSTEM METRICS</h3>
            <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              ACTIVE
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <p className="text-[10px] text-white/40 uppercase font-bold mb-1 font-mono">Total Sales</p>
              <p className="text-xl font-black text-white">$14.2K</p>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <p className="text-[10px] text-white/40 uppercase font-bold mb-1 font-mono">Storage</p>
              <p className="text-xl font-black text-orange-500">84%</p>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 col-span-2 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/40 uppercase font-bold mb-0.5 font-mono">Active Sessions</p>
                <p className="text-xl font-black text-white">1,284</p>
              </div>
              <span className="text-[11px] text-green-400 font-mono font-bold bg-green-950/40 px-2 py-1 rounded border border-green-500/30">
                +12% vs LY
              </span>
            </div>
          </div>
        </div>

        {/* Highlight 3: Quick Action Card (Orange Gradient) */}
        <div className="bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden text-black shadow-[0_0_25px_rgba(234,88,12,0.3)]">
          <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-sm font-black uppercase tracking-widest text-black mb-1">
              Admin Quick Actions
            </h3>
            <p className="text-black/70 text-xs font-medium leading-tight mb-4">
              Control encrypted distributions, game assets, and security parameters.
            </p>
          </div>
          <div className="space-y-2 relative z-10">
            <button
              onClick={() => setActiveView("admin")}
              className="w-full py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 transition-colors"
            >
              Upload New Game File
            </button>
            <button
              onClick={() => setActiveView("admin")}
              className="w-full py-2.5 bg-black/20 text-black text-[10px] font-black uppercase tracking-widest border border-black/20 hover:bg-black/30 transition-colors"
            >
              Site Visual Editor
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
