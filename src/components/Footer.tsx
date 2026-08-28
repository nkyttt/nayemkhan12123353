import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Gamepad2,
  Github,
  Twitter,
  Youtube,
  Send,
  Shield,
  Heart,
  ExternalLink,
  Mail,
  CheckCircle,
} from "lucide-react";

export const Footer: React.FC = () => {
  const { siteConfig, setActiveView, addNotification } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    addNotification({
      title: "🚀 Subscribed to Cyber Intel",
      message: `${newsletterEmail} added to game drop alerts.`,
      type: "system",
    });
    setNewsletterEmail("");
  };

  const footer = siteConfig.footerConfig;

  return (
    <footer id="main-site-footer" className="bg-black/60 border-t border-white/10 pt-16 pb-12 font-mono backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)] text-black">
                <Gamepad2 className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-black tracking-tight text-white uppercase">
                {siteConfig.siteName}
              </span>
            </div>

            <p className="text-xs text-white/60 max-w-sm leading-relaxed font-sans">
              {siteConfig.siteDescription ||
                "Unified Game File Hosting, Digital Store & Portfolio Platform for modern game creators and players."}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-orange-400 hover:border-orange-500/40 transition-all"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-orange-400 hover:border-orange-500/40 transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-orange-400 hover:border-orange-500/40 transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Game Vault */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-sm">Game Vault</h4>
            <ul className="space-y-2 text-white/60">
              <li>
                <button onClick={() => setActiveView("games")} className="hover:text-orange-400 transition-colors">
                  All Games
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("games")} className="hover:text-orange-400 transition-colors">
                  Featured Indie Builds
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("games")} className="hover:text-orange-400 transition-colors">
                  Free Playable Demos
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("games")} className="hover:text-orange-400 transition-colors">
                  Fast Direct Downloads
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Creator Store */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-sm">Creator Store</h4>
            <ul className="space-y-2 text-white/60">
              <li>
                <button onClick={() => setActiveView("store")} className="hover:text-orange-400 transition-colors">
                  Unreal & Unity Assets
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("store")} className="hover:text-orange-400 transition-colors">
                  Custom HLSL Shaders
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("store")} className="hover:text-orange-400 transition-colors">
                  Source Code & Toolkits
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("creator-dashboard")} className="hover:text-orange-400 transition-colors">
                  Become a Seller
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-sm">Drop Alerts</h4>
            <p className="text-white/60 text-[11px] font-sans">
              Receive zero-day game release builds and discount codes.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-xl bg-green-950/60 border border-green-500/40 text-green-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="gamer@domain.com"
                    className="w-full pl-3 pr-9 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-white/40 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white hover:bg-orange-500 hover:text-white text-black font-bold transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <p>{footer?.copyrightText || "© 2026 GameHub CXT • All Rights Reserved."}</p>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveView("admin")} className="hover:text-orange-400 transition-colors">
              Admin Portal
            </button>
            <button onClick={() => setActiveView("portfolio")} className="hover:text-orange-400 transition-colors">
              Developer Portfolio
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
