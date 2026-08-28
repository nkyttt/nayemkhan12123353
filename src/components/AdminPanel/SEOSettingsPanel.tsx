import React, { useState, useMemo } from "react";
import { SiteConfig, Game, DigitalProduct, PortfolioProject } from "../../types";
import {
  Search,
  Globe,
  Share2,
  FileCode,
  Code,
  Copy,
  Check,
  Download,
  ExternalLink,
  Eye,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Layers,
  Smartphone,
  Monitor,
  Image as ImageIcon,
  Tag,
  Sliders,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";

interface SEOSettingsPanelProps {
  draftConfig: SiteConfig;
  setDraftConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  onSave: () => void;
  saveSuccess: boolean;
  games: Game[];
  products: DigitalProduct[];
  projects: PortfolioProject[];
}

export const SEOSettingsPanel: React.FC<SEOSettingsPanelProps> = ({
  draftConfig,
  setDraftConfig,
  onSave,
  saveSuccess,
  games,
  products,
  projects,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"meta" | "opengraph" | "sitemap" | "schema">("meta");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [socialPlatform, setSocialPlatform] = useState<"google" | "twitter" | "discord" | "facebook">("google");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [newKeywordInput, setNewKeywordInput] = useState("");

  const baseUrl = draftConfig.canonicalUrl || `https://${draftConfig.customDomain || "gamehubcxt.io"}`;

  // Parse keywords
  const keywordsList = useMemo(() => {
    return draftConfig.seoKeywords
      ? draftConfig.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];
  }, [draftConfig.seoKeywords]);

  const handleAddKeyword = (kw: string) => {
    const trimmed = kw.trim();
    if (!trimmed || keywordsList.includes(trimmed)) return;
    const updated = [...keywordsList, trimmed].join(", ");
    setDraftConfig((prev) => ({ ...prev, seoKeywords: updated }));
    setNewKeywordInput("");
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    const updated = keywordsList.filter((k) => k !== kwToRemove).join(", ");
    setDraftConfig((prev) => ({ ...prev, seoKeywords: updated }));
  };

  // SEO Health Score Computation
  const seoScore = useMemo(() => {
    let score = 0;
    if (draftConfig.seoTitle && draftConfig.seoTitle.length >= 10 && draftConfig.seoTitle.length <= 70) score += 20;
    else if (draftConfig.seoTitle) score += 10;

    if (draftConfig.seoDescription && draftConfig.seoDescription.length >= 50 && draftConfig.seoDescription.length <= 160) score += 25;
    else if (draftConfig.seoDescription) score += 12;

    if (keywordsList.length >= 3) score += 15;
    else if (keywordsList.length > 0) score += 8;

    if (draftConfig.ogImageUrl && draftConfig.ogImageUrl.startsWith("http")) score += 20;
    if (draftConfig.canonicalUrl && draftConfig.canonicalUrl.startsWith("http")) score += 10;
    if (draftConfig.enableJsonLd !== false) score += 10;

    return Math.min(100, score);
  }, [draftConfig, keywordsList]);

  // Sitemap XML Generator
  const sitemapXml = useMemo(() => {
    const sitemapConfig = draftConfig.sitemapConfig || {
      includeGames: true,
      includeProducts: true,
      includePortfolio: true,
      changefreq: "daily",
      priority: 0.8,
      lastmod: new Date().toISOString().split("T")[0],
    };

    const today = new Date().toISOString().split("T")[0];
    let urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: number }> = [
      { loc: `${baseUrl}/`, lastmod: today, changefreq: "daily", priority: 1.0 },
      { loc: `${baseUrl}/#games`, lastmod: today, changefreq: "daily", priority: 0.9 },
      { loc: `${baseUrl}/#store`, lastmod: today, changefreq: "daily", priority: 0.9 },
      { loc: `${baseUrl}/#portfolio`, lastmod: today, changefreq: "weekly", priority: 0.8 },
      { loc: `${baseUrl}/#skills`, lastmod: today, changefreq: "monthly", priority: 0.6 },
    ];

    if (sitemapConfig.includeGames) {
      games.forEach((game) => {
        urls.push({
          loc: `${baseUrl}/games/${game.slug || game.id}`,
          lastmod: game.releaseDate || today,
          changefreq: sitemapConfig.changefreq || "weekly",
          priority: 0.8,
        });
      });
    }

    if (sitemapConfig.includeProducts) {
      products.forEach((prod) => {
        urls.push({
          loc: `${baseUrl}/store/${prod.slug || prod.id}`,
          lastmod: today,
          changefreq: sitemapConfig.changefreq || "weekly",
          priority: 0.7,
        });
      });
    }

    if (sitemapConfig.includePortfolio) {
      projects.forEach((proj) => {
        urls.push({
          loc: `${baseUrl}/portfolio/${proj.id}`,
          lastmod: proj.date || today,
          changefreq: "monthly",
          priority: 0.6,
        });
      });
    }

    const xmlLines = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
      `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
      ...urls.map(
        (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`
      ),
      `</urlset>`,
    ];

    return xmlLines.join("\n");
  }, [draftConfig, games, products, projects, baseUrl]);

  // Robots.txt content
  const robotsTxt = useMemo(() => {
    const isIndex = draftConfig.robotsIndex !== false;
    const isFollow = draftConfig.robotsFollow !== false;

    return `# GameHub CXT Autonomous Robots Directives
User-agent: *
${isIndex ? "Allow: /" : "Disallow: /"}
${!isIndex ? "Disallow: /admin\nDisallow: /api/\nDisallow: /checkout" : "Disallow: /admin\nDisallow: /api/"}

# Direct Sitemap Pointer
Sitemap: ${baseUrl}/sitemap.xml
`;
  }, [draftConfig, baseUrl]);

  // JSON-LD Structured Data
  const jsonLdSchema = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${baseUrl}/#website`,
          "url": baseUrl,
          "name": draftConfig.siteName || "GameHub CXT",
          "description": draftConfig.seoDescription,
          "publisher": {
            "@type": "Organization",
            "name": draftConfig.authorName || "GameHub CXT Interactive",
            "logo": {
              "@type": "ImageObject",
              "url": draftConfig.logoUrl,
            },
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${baseUrl}/?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`,
          "name": draftConfig.siteName,
          "url": baseUrl,
          "logo": draftConfig.logoUrl,
          "sameAs": [
            draftConfig.socialLinks.discord,
            draftConfig.socialLinks.youtube,
            draftConfig.socialLinks.twitter,
            draftConfig.socialLinks.github,
          ].filter(Boolean),
        },
        {
          "@type": "ItemList",
          "name": "Featured Hosted Games",
          "itemListElement": games.slice(0, 5).map((game, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "item": {
              "@type": "VideoGame",
              "name": game.title,
              "description": game.description,
              "image": game.coverImage,
              "operatingSystem": "Windows, Linux, macOS",
              "applicationCategory": "Game",
              "offers": {
                "@type": "Offer",
                "price": game.isFree ? "0.00" : (game.discountPrice || game.price).toString(),
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
              },
            },
          })),
        },
      ],
    };
  }, [draftConfig, baseUrl, games]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const htmlMetaTags = `<!-- GameHub CXT Global Meta & OpenGraph Tags -->
<title>${draftConfig.seoTitle || draftConfig.siteName}</title>
<meta name="description" content="${draftConfig.seoDescription}" />
<meta name="keywords" content="${draftConfig.seoKeywords}" />
<meta name="author" content="${draftConfig.authorName || "GameHub CXT"}" />
<link rel="canonical" href="${baseUrl}" />
<meta name="robots" content="${draftConfig.robotsIndex !== false ? "index" : "noindex"}, ${draftConfig.robotsFollow !== false ? "follow" : "nofollow"}" />

<!-- OpenGraph / Facebook -->
<meta property="og:type" content="${draftConfig.ogType || "website"}" />
<meta property="og:url" content="${baseUrl}" />
<meta property="og:title" content="${draftConfig.ogTitle || draftConfig.seoTitle}" />
<meta property="og:description" content="${draftConfig.ogDescription || draftConfig.seoDescription}" />
<meta property="og:image" content="${draftConfig.ogImageUrl || draftConfig.fallbackImageUrl}" />

<!-- Twitter / X Card -->
<meta name="twitter:card" content="${draftConfig.twitterCard || "summary_large_image"}" />
<meta name="twitter:creator" content="${draftConfig.twitterCreator || "@gamehubcxt"}" />
<meta name="twitter:title" content="${draftConfig.ogTitle || draftConfig.seoTitle}" />
<meta name="twitter:description" content="${draftConfig.ogDescription || draftConfig.seoDescription}" />
<meta name="twitter:image" content="${draftConfig.ogImageUrl || draftConfig.fallbackImageUrl}" />`;

  return (
    <div className="space-y-6">
      {/* Top Banner with SEO Health Score */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-purple-500/10 border border-orange-500/20 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/20">
              <Search className="w-3.5 h-3.5" />
              SEO & Social Graph Optimization Engine
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Platform Meta Tags, OpenGraph & XML Sitemap
            </h2>
            <p className="text-white/60 text-sm max-w-2xl">
              Configure search engine indexing directives, rich social media previews for Discord/Twitter,
              and auto-generate Google Search Console sitemaps for games, assets, and portfolios.
            </p>
          </div>

          {/* Health Gauge & Save Trigger */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/40 border border-white/10">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-white/10"
                    fill="transparent"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    stroke="currentColor"
                    strokeWidth="4"
                    className={seoScore >= 80 ? "text-emerald-400" : seoScore >= 50 ? "text-amber-400" : "text-orange-400"}
                    fill="transparent"
                    strokeDasharray={113}
                    strokeDashoffset={113 - (113 * seoScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-black text-white">{seoScore}%</span>
              </div>
              <div>
                <div className="text-xs text-white/50 font-medium">SEO Health</div>
                <div className="text-sm font-bold text-white">
                  {seoScore >= 80 ? "Optimized" : seoScore >= 50 ? "Moderate" : "Needs Setup"}
                </div>
              </div>
            </div>

            <button
              id="seo-save-btn"
              onClick={onSave}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm transition-all shadow-lg ${
                saveSuccess
                  ? "bg-emerald-500 text-white shadow-emerald-500/20"
                  : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20"
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved Changes!
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Save SEO Config
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/10 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab("meta")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === "meta"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Globe className="w-4 h-4" />
            Global Meta Tags
          </button>

          <button
            onClick={() => setActiveSubTab("opengraph")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === "opengraph"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Share2 className="w-4 h-4" />
            OpenGraph & Social Cards
          </button>

          <button
            onClick={() => setActiveSubTab("sitemap")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === "sitemap"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FileCode className="w-4 h-4" />
            XML Sitemap & Robots.txt
          </button>

          <button
            onClick={() => setActiveSubTab("schema")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === "schema"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Code className="w-4 h-4" />
            JSON-LD Schema Markup
          </button>
        </div>
      </div>

      {/* SUBTAB 1: GLOBAL META TAGS */}
      {activeSubTab === "meta" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Settings */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-orange-400" />
                Search Engine Directives & Title
              </h3>

              {/* Meta Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-white/80">Page & Meta Title Tag</label>
                  <span className={`font-mono ${draftConfig.seoTitle.length > 60 ? "text-amber-400" : "text-white/40"}`}>
                    {draftConfig.seoTitle.length} / 60 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={draftConfig.seoTitle}
                  onChange={(e) => setDraftConfig((prev) => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder="e.g. GameHub CXT | Next-Gen Game Hosting & Creator Assets"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-orange-500 focus:outline-none text-sm transition-all"
                />
                <p className="text-[11px] text-white/40">
                  Recommended: 50–60 characters. Appears as the clickable blue headline in Google search results.
                </p>
              </div>

              {/* Meta Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-white/80">Meta Description</label>
                  <span
                    className={`font-mono ${
                      draftConfig.seoDescription.length > 160
                        ? "text-red-400"
                        : draftConfig.seoDescription.length < 50
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {draftConfig.seoDescription.length} / 160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={draftConfig.seoDescription}
                  onChange={(e) => setDraftConfig((prev) => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder="Download action-packed indie games, purchase source code and game assets..."
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-orange-500 focus:outline-none text-sm transition-all resize-none"
                />
                <p className="text-[11px] text-white/40">
                  Recommended: 120–160 characters. Keep it compelling with clear call-to-actions.
                </p>
              </div>

              {/* Canonical URL & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">Canonical Base URL</label>
                  <input
                    type="url"
                    value={draftConfig.canonicalUrl || ""}
                    onChange={(e) => setDraftConfig((prev) => ({ ...prev, canonicalUrl: e.target.value }))}
                    placeholder="https://gamehubcxt.io"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-orange-500 focus:outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">Author / Publisher Tag</label>
                  <input
                    type="text"
                    value={draftConfig.authorName || ""}
                    onChange={(e) => setDraftConfig((prev) => ({ ...prev, authorName: e.target.value }))}
                    placeholder="GameHub CXT Studio"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-orange-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Keywords Tag Manager */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-white/80 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-orange-400" />
                    SEO Meta Keywords ({keywordsList.length})
                  </label>
                </div>

                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-black/30 border border-white/10 min-h-[48px]">
                  {keywordsList.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-300 text-xs border border-orange-500/20"
                    >
                      {kw}
                      <button
                        onClick={() => handleRemoveKeyword(kw)}
                        className="hover:text-red-400 text-white/50 text-xs font-bold leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {keywordsList.length === 0 && (
                    <span className="text-white/30 text-xs italic">No keywords specified yet.</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newKeywordInput}
                    onChange={(e) => setNewKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddKeyword(newKeywordInput);
                      }
                    }}
                    placeholder="Add keyword (e.g., 'unreal engine 5', 'game distribution') & press Enter"
                    className="flex-1 px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:border-orange-500 focus:outline-none text-xs"
                  />
                  <button
                    onClick={() => handleAddKeyword(newKeywordInput)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                  >
                    Add
                  </button>
                </div>

                {/* Quick Keyword Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-white/40">Suggested:</span>
                  {["indie games", "direct downloads", "unreal engine source", "game ui kits", "3d shaders", "game developers"].map((sugg) => (
                    <button
                      key={sugg}
                      onClick={() => handleAddKeyword(sugg)}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-orange-500/20 text-white/60 hover:text-orange-300 text-[10px] border border-white/5 transition-all"
                    >
                      +{sugg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Robots Directives */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Crawler Indexing & Robots Policy
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                    <div>
                      <div className="text-xs font-bold text-white">Allow Search Indexing</div>
                      <div className="text-[11px] text-white/40">robots="index" directive</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={draftConfig.robotsIndex !== false}
                      onChange={(e) => setDraftConfig((prev) => ({ ...prev, robotsIndex: e.target.checked }))}
                      className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                    <div>
                      <div className="text-xs font-bold text-white">Follow Outbound Links</div>
                      <div className="text-[11px] text-white/40">robots="follow" directive</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={draftConfig.robotsFollow !== false}
                      onChange={(e) => setDraftConfig((prev) => ({ ...prev, robotsFollow: e.target.checked }))}
                      className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Live Search Engine SERP Simulator */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 sticky top-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-orange-400" />
                  Google Search Snippet Preview
                </h3>
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded text-xs transition-all ${
                      previewDevice === "desktop" ? "bg-orange-500 text-white" : "text-white/50 hover:text-white"
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded text-xs transition-all ${
                      previewDevice === "mobile" ? "bg-orange-500 text-white" : "text-white/50 hover:text-white"
                    }`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SERP Card */}
              <div
                className={`p-4 rounded-xl bg-neutral-900 border border-neutral-700/80 space-y-1.5 font-sans ${
                  previewDevice === "mobile" ? "max-w-[340px] mx-auto text-xs" : "text-sm"
                }`}
              >
                {/* SERP Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <div className="w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center text-[10px] text-orange-400 font-bold">
                    G
                  </div>
                  <div className="flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    <span className="text-neutral-200">{draftConfig.siteName || "GameHub CXT"}</span>
                    <span className="text-neutral-500">›</span>
                    <span className="text-neutral-400">{baseUrl}</span>
                  </div>
                </div>

                {/* SERP Blue Title */}
                <h4 className="text-[#8ab4f8] text-base hover:underline cursor-pointer font-medium leading-snug break-words">
                  {draftConfig.seoTitle || `${draftConfig.siteName} | Game Hosting & Asset Store`}
                </h4>

                {/* SERP Description */}
                <p className="text-[#bdc1c6] text-xs leading-relaxed line-clamp-3">
                  {draftConfig.seoDescription ||
                    "Download verified game packages, purchase development tools and source code, and explore developer portfolios."}
                </p>

                {/* SERP Sitelinks Preview */}
                <div className="grid grid-cols-2 gap-2 pt-2 mt-2 border-t border-neutral-800 text-[11px]">
                  <div className="text-[#8ab4f8] hover:underline cursor-pointer">🎮 Hosted Games Vault</div>
                  <div className="text-[#8ab4f8] hover:underline cursor-pointer">🛍️ Digital Store & Assets</div>
                  <div className="text-[#8ab4f8] hover:underline cursor-pointer">💼 Developer Portfolio</div>
                  <div className="text-[#8ab4f8] hover:underline cursor-pointer">⚡ Fast Direct Downloads</div>
                </div>
              </div>

              {/* Quick HTML Snippet Copy */}
              <div className="pt-2">
                <button
                  onClick={() => copyToClipboard(htmlMetaTags, "meta")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all"
                >
                  {copiedType === "meta" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      HTML Tags Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy &lt;meta&gt; HTML Tags
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: OPENGRAPH & SOCIAL CARDS */}
      {activeSubTab === "opengraph" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Settings Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-orange-400" />
                Social Graph & Card Media
              </h3>

              {/* OpenGraph Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">Social Share Title (og:title)</label>
                <input
                  type="text"
                  value={draftConfig.ogTitle || draftConfig.seoTitle || ""}
                  onChange={(e) => setDraftConfig((prev) => ({ ...prev, ogTitle: e.target.value }))}
                  placeholder="e.g. GameHub CXT • Game Distribution & Creator Arsenal"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-orange-500 focus:outline-none text-sm"
                />
              </div>

              {/* OpenGraph Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">Social Share Description (og:description)</label>
                <textarea
                  rows={2}
                  value={draftConfig.ogDescription || draftConfig.seoDescription || ""}
                  onChange={(e) => setDraftConfig((prev) => ({ ...prev, ogDescription: e.target.value }))}
                  placeholder="Discover playable indie masterpieces, verified game builds, UI kits, and 3D assets..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-orange-500 focus:outline-none text-sm resize-none"
                />
              </div>

              {/* OpenGraph Image URL */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
                  <span>Social Share Image URL (og:image & twitter:image)</span>
                  <span className="text-white/40 text-[10px]">Recommended: 1200 × 630 px</span>
                </label>
                <input
                  type="url"
                  value={draftConfig.ogImageUrl || ""}
                  onChange={(e) => setDraftConfig((prev) => ({ ...prev, ogImageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-orange-500 focus:outline-none text-sm"
                />

                {/* Preset Image Chooser */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-white/40">Quick preset game banners:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {games.slice(0, 4).map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setDraftConfig((prev) => ({ ...prev, ogImageUrl: g.bannerImage || g.coverImage }))}
                        className="relative group rounded-lg overflow-hidden border border-white/10 hover:border-orange-500 aspect-video"
                      >
                        <img
                          src={g.bannerImage || g.coverImage}
                          alt={g.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-all">
                          Select
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Twitter & Type Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">Twitter Card Layout</label>
                  <select
                    value={draftConfig.twitterCard || "summary_large_image"}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        twitterCard: e.target.value as "summary" | "summary_large_image",
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-orange-500 focus:outline-none text-sm"
                  >
                    <option value="summary_large_image">Large Image Card (Recommended)</option>
                    <option value="summary">Standard Compact Card</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">Twitter / X Handle</label>
                  <input
                    type="text"
                    value={draftConfig.twitterCreator || "@gamehubcxt"}
                    onChange={(e) => setDraftConfig((prev) => ({ ...prev, twitterCreator: e.target.value }))}
                    placeholder="@gamehubcxt"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-orange-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Previews Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-orange-400" />
                  Live Social Sharing Preview
                </h3>

                {/* Platform Switcher */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 text-xs">
                  <button
                    onClick={() => setSocialPlatform("twitter")}
                    className={`px-2.5 py-1 rounded font-bold transition-all ${
                      socialPlatform === "twitter" ? "bg-orange-500 text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    X / Twitter
                  </button>
                  <button
                    onClick={() => setSocialPlatform("discord")}
                    className={`px-2.5 py-1 rounded font-bold transition-all ${
                      socialPlatform === "discord" ? "bg-indigo-600 text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    Discord
                  </button>
                  <button
                    onClick={() => setSocialPlatform("facebook")}
                    className={`px-2.5 py-1 rounded font-bold transition-all ${
                      socialPlatform === "facebook" ? "bg-blue-600 text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    Facebook
                  </button>
                </div>
              </div>

              {/* TWITTER PREVIEW */}
              {socialPlatform === "twitter" && (
                <div className="p-4 rounded-2xl bg-black border border-neutral-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-black text-white text-sm">
                      GH
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold flex items-center gap-1.5">
                        {draftConfig.siteName || "GameHub CXT"}
                        <span className="text-white/40 text-xs font-normal">
                          {draftConfig.twitterCreator || "@gamehubcxt"} • 1m
                        </span>
                      </div>
                      <div className="text-white/70 text-xs">
                        🚀 Check out the new games and digital creator assets on the platform!
                      </div>
                    </div>
                  </div>

                  {/* Card Container */}
                  <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                    <div className="aspect-[1.91/1] w-full bg-neutral-900 overflow-hidden relative">
                      {draftConfig.ogImageUrl ? (
                        <img
                          src={draftConfig.ogImageUrl}
                          alt="OG Card"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/30 gap-2">
                          <ImageIcon className="w-8 h-8" />
                          <span className="text-xs">No OG Image Specified</span>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-white font-medium backdrop-blur-sm">
                        {draftConfig.customDomain || "gamehubcxt.io"}
                      </div>
                    </div>
                    <div className="p-3 space-y-1">
                      <div className="text-[11px] text-white/40 uppercase font-bold tracking-wider">
                        {draftConfig.customDomain || "gamehubcxt.io"}
                      </div>
                      <h4 className="text-white text-sm font-bold leading-snug line-clamp-1">
                        {draftConfig.ogTitle || draftConfig.seoTitle || "GameHub CXT"}
                      </h4>
                      <p className="text-white/60 text-xs line-clamp-2 leading-relaxed">
                        {draftConfig.ogDescription || draftConfig.seoDescription}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* DISCORD PREVIEW */}
              {socialPlatform === "discord" && (
                <div className="p-4 rounded-xl bg-[#2b2d31] border border-[#1e1f22] space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#949ba4]">
                    <span className="font-bold text-white">BotMaster</span>
                    <span className="px-1 py-0.2 rounded bg-[#5865f2] text-white text-[9px] font-bold">BOT</span>
                    <span>Today at 12:00 PM</span>
                  </div>
                  <div className="text-xs text-[#00a8fc] hover:underline cursor-pointer">{baseUrl}</div>

                  {/* Discord Embed */}
                  <div className="border-l-4 border-orange-500 rounded bg-[#1e1f22] p-3 space-y-2 max-w-md">
                    <div className="text-[10px] text-[#949ba4] uppercase font-bold">
                      {draftConfig.siteName || "GameHub CXT"}
                    </div>
                    <div className="text-sm font-bold text-[#00a8fc] hover:underline cursor-pointer">
                      {draftConfig.ogTitle || draftConfig.seoTitle || "GameHub CXT"}
                    </div>
                    <p className="text-xs text-[#dbdee1] leading-relaxed line-clamp-3">
                      {draftConfig.ogDescription || draftConfig.seoDescription}
                    </p>

                    {draftConfig.ogImageUrl && (
                      <div className="rounded overflow-hidden mt-2 aspect-video max-h-48">
                        <img
                          src={draftConfig.ogImageUrl}
                          alt="Discord Embed"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FACEBOOK PREVIEW */}
              {socialPlatform === "facebook" && (
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <div className="rounded-lg overflow-hidden border border-neutral-700 bg-neutral-800">
                    <div className="aspect-[1.91/1] w-full bg-neutral-950 overflow-hidden">
                      {draftConfig.ogImageUrl && (
                        <img
                          src={draftConfig.ogImageUrl}
                          alt="Facebook preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className="p-3 bg-neutral-800 space-y-1">
                      <div className="text-[10px] text-white/50 uppercase font-semibold">
                        {(draftConfig.customDomain || "GAMEHUBCXT.IO").toUpperCase()}
                      </div>
                      <div className="text-sm font-bold text-white line-clamp-1">
                        {draftConfig.ogTitle || draftConfig.seoTitle}
                      </div>
                      <div className="text-xs text-white/60 line-clamp-2">
                        {draftConfig.ogDescription || draftConfig.seoDescription}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: XML SITEMAP & ROBOTS.TXT */}
      {activeSubTab === "sitemap" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sitemap Settings Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-orange-400" />
                Sitemap Generator Options
              </h3>

              <div className="space-y-3">
                {/* Games Option */}
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Include Hosted Games</span>
                      <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[10px]">
                        {games.length} URLs
                      </span>
                    </div>
                    <div className="text-[11px] text-white/40">Inject /games/:slug canonical URLs</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draftConfig.sitemapConfig?.includeGames !== false}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        sitemapConfig: {
                          ...(prev.sitemapConfig || {
                            includeGames: true,
                            includeProducts: true,
                            includePortfolio: true,
                            changefreq: "daily",
                            priority: 0.8,
                          }),
                          includeGames: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                </label>

                {/* Products Option */}
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Include Store Assets</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                        {products.length} URLs
                      </span>
                    </div>
                    <div className="text-[11px] text-white/40">Inject /store/:slug asset listings</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draftConfig.sitemapConfig?.includeProducts !== false}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        sitemapConfig: {
                          ...(prev.sitemapConfig || {
                            includeGames: true,
                            includeProducts: true,
                            includePortfolio: true,
                            changefreq: "daily",
                            priority: 0.8,
                          }),
                          includeProducts: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                </label>

                {/* Portfolio Option */}
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Include Portfolio Projects</span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px]">
                        {projects.length} URLs
                      </span>
                    </div>
                    <div className="text-[11px] text-white/40">Inject /portfolio project URLs</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draftConfig.sitemapConfig?.includePortfolio !== false}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        sitemapConfig: {
                          ...(prev.sitemapConfig || {
                            includeGames: true,
                            includeProducts: true,
                            includePortfolio: true,
                            changefreq: "daily",
                            priority: 0.8,
                          }),
                          includePortfolio: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Changefreq & Priority */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">Change Frequency</label>
                  <select
                    value={draftConfig.sitemapConfig?.changefreq || "daily"}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        sitemapConfig: {
                          ...(prev.sitemapConfig || {
                            includeGames: true,
                            includeProducts: true,
                            includePortfolio: true,
                            changefreq: "daily",
                            priority: 0.8,
                          }),
                          changefreq: e.target.value as any,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                  >
                    <option value="always">always</option>
                    <option value="hourly">hourly</option>
                    <option value="daily">daily</option>
                    <option value="weekly">weekly</option>
                    <option value="monthly">monthly</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">Default Priority</label>
                  <select
                    value={draftConfig.sitemapConfig?.priority || 0.8}
                    onChange={(e) =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        sitemapConfig: {
                          ...(prev.sitemapConfig || {
                            includeGames: true,
                            includeProducts: true,
                            includePortfolio: true,
                            changefreq: "daily",
                            priority: 0.8,
                          }),
                          priority: parseFloat(e.target.value),
                        },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                  >
                    <option value="1.0">1.0 (Critical)</option>
                    <option value="0.8">0.8 (High)</option>
                    <option value="0.6">0.6 (Medium)</option>
                    <option value="0.4">0.4 (Low)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <button
                  onClick={() => downloadFile(sitemapXml, "sitemap.xml", "application/xml")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20"
                >
                  <Download className="w-4 h-4" />
                  Download sitemap.xml File
                </button>

                <button
                  onClick={() => downloadFile(robotsTxt, "robots.txt", "text/plain")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download robots.txt Directives
                </button>
              </div>
            </div>
          </div>

          {/* XML Live Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-orange-400" />
                  Generated sitemap.xml Output
                </h3>
                <button
                  onClick={() => copyToClipboard(sitemapXml, "sitemap")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                >
                  {copiedType === "sitemap" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy XML
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-black/60 border border-white/10 font-mono text-xs text-emerald-400/90 p-4 max-h-[380px] overflow-y-auto">
                <pre className="whitespace-pre">{sitemapXml}</pre>
              </div>
            </div>

            {/* robots.txt preview */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Generated robots.txt File Directives
                </h3>
                <button
                  onClick={() => copyToClipboard(robotsTxt, "robots")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                >
                  {copiedType === "robots" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy robots.txt
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-amber-300/90 p-4">
                <pre className="whitespace-pre">{robotsTxt}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: JSON-LD SCHEMA MARKUP */}
      {activeSubTab === "schema" && (
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-orange-400" />
                Schema.org JSON-LD Structured Data
              </h3>
              <p className="text-white/60 text-xs">
                Empowers Google Rich Results with VideoGame, Organization, and OfferCatalog structured snippets.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-white font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftConfig.enableJsonLd !== false}
                  onChange={(e) => setDraftConfig((prev) => ({ ...prev, enableJsonLd: e.target.checked }))}
                  className="w-4 h-4 accent-orange-500 rounded"
                />
                Enable Structured Data
              </label>

              <button
                onClick={() => copyToClipboard(JSON.stringify(jsonLdSchema, null, 2), "schema")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20"
              >
                {copiedType === "schema" ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied JSON-LD!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy JSON-LD Script
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-cyan-300/90 p-4 max-h-[420px] overflow-y-auto">
            <pre>{JSON.stringify(jsonLdSchema, null, 2)}</pre>
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-xs text-blue-200">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-white">Google Rich Results Integration: </span>
              This structured JSON-LD format is automatically mounted in the document head and provides search engines with rich gaming catalog cards, developer organization links, and instant price details.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
