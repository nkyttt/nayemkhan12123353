import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Layers,
  PlusCircle,
  DollarSign,
  Package,
  Download,
  Upload,
  Sparkles,
  TrendingUp,
  FileCode,
  CheckCircle,
} from "lucide-react";

export const CreatorDashboard: React.FC = () => {
  const { games, products, addProduct, addGame, addNotification } = useApp();

  const [activeTab, setActiveTab] = useState<"overview" | "add-product" | "add-game">("overview");

  // Add Product Form State
  const [prodTitle, setProdTitle] = useState("");
  const [prodCategory, setProdCategory] = useState<any>("Game Assets");
  const [prodPrice, setProdPrice] = useState<number>(19.99);
  const [prodDesc, setProdDesc] = useState("");
  const [prodFileName, setProdFileName] = useState("AssetPackage_v1.0.zip");
  const [prodFileSize, setProdFileSize] = useState("250 MB");
  const [prodThumbnail, setProdThumbnail] = useState("https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80");
  const [prodLicense, setProdLicense] = useState<any>("Commercial");
  const [prodTags, setProdTags] = useState("UE5, Shaders, HLSL");

  // Add Game Form State
  const [gameTitle, setGameTitle] = useState("");
  const [gameCategory, setGameCategory] = useState<any>("Action");
  const [gameVersion, setGameVersion] = useState("1.0.0");
  const [gamePrice, setGamePrice] = useState<number>(0);
  const [gameDesc, setGameDesc] = useState("");
  const [gameCover, setGameCover] = useState("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80");
  const [gameFileName, setGameFileName] = useState("GameSetup_v1.0.zip");
  const [gameFileSize, setGameFileSize] = useState("4.5 GB");

  const totalSalesCount = products.reduce((acc, p) => acc + p.salesCount, 0);
  const totalRevenue = products.reduce((acc, p) => acc + p.salesCount * (p.discountPrice || p.price), 0);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle) return;

    await addProduct({
      title: prodTitle,
      slug: prodTitle.toLowerCase().replace(/\s+/g, "-"),
      description: prodDesc || "High-quality production ready game dev asset.",
      category: prodCategory,
      price: prodPrice,
      isFree: prodPrice === 0,
      thumbnail: prodThumbnail,
      gallery: [prodThumbnail],
      version: "1.0",
      licenseType: prodLicense,
      tags: prodTags.split(",").map((t) => t.trim()),
      fileUrl: `https://storage.gamehubcxt.io/assets/${prodFileName}`,
      fileName: prodFileName,
      fileSize: prodFileSize,
      salesCount: 0,
      rating: 5.0,
      reviewsCount: 0,
      isFeatured: false,
      creatorId: "creator-nk",
      creatorName: "NK Spider Studios",
    });

    setProdTitle("");
    setProdDesc("");
    setActiveTab("overview");
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameTitle) return;

    await addGame({
      title: gameTitle,
      slug: gameTitle.toLowerCase().replace(/\s+/g, "-"),
      description: gameDesc || "Exciting new indie title hosted on GameHub CXT.",
      category: gameCategory,
      version: gameVersion,
      developer: "NK Spider Studios",
      publisher: "GameHub CXT Interactive",
      releaseDate: new Date().toISOString().split("T")[0],
      coverImage: gameCover,
      bannerImage: gameCover,
      screenshots: [gameCover],
      fileUrl: `https://storage.gamehubcxt.io/builds/${gameFileName}`,
      fileName: gameFileName,
      fileSize: gameFileSize,
      fileType: ".zip",
      price: gamePrice,
      isFree: gamePrice === 0,
      isFeatured: false,
      rating: 5.0,
      reviewsCount: 0,
      downloadsCount: 0,
      tags: ["Indie", gameCategory],
      minCpu: "Intel Core i5",
      minGpu: "GTX 1060 6GB",
      minRam: "16 GB",
      minStorage: gameFileSize,
      minOs: "Windows 10 / 11",
      status: "published",
    });

    setGameTitle("");
    setGameDesc("");
    setActiveTab("overview");
  };

  return (
    <div id="creator-dashboard-page" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">Marketplace Hub</span>
          <h1 className="text-3xl font-black text-white font-mono uppercase">
            Creator & Publisher Portal
          </h1>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === "overview" ? "bg-amber-500 text-slate-950" : "bg-[#0d1322] text-slate-400 border border-slate-800"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("add-product")}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "add-product" ? "bg-amber-500 text-slate-950" : "bg-[#0d1322] text-slate-400 border border-slate-800"
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Add Asset
          </button>
          <button
            onClick={() => setActiveTab("add-game")}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "add-game" ? "bg-amber-500 text-slate-950" : "bg-[#0d1322] text-slate-400 border border-slate-800"
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Host New Game
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in">
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            <div className="p-6 rounded-2xl bg-[#0d1322] border border-amber-900/40 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Gross Sales</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white">${totalRevenue.toFixed(2)}</div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +18.4% this month
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-[#0d1322] border border-cyan-900/40 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Units Sold</span>
                <Package className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white">{totalSalesCount}</div>
              <span className="text-[11px] text-slate-400">Across {products.length} store assets</span>
            </div>

            <div className="p-6 rounded-2xl bg-[#0d1322] border border-purple-900/40 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Hosted Games</span>
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-white">{games.length}</div>
              <span className="text-[11px] text-slate-400">Active distribution builds</span>
            </div>

            <div className="p-6 rounded-2xl bg-[#0d1322] border border-blue-900/40 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Game Downloads</span>
                <Download className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {games.reduce((a, b) => a + b.downloadsCount, 0).toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-400">Direct CDN Delivered</span>
            </div>
          </div>

          {/* Published Products Table */}
          <div className="p-6 rounded-3xl bg-[#0d1322] border border-cyan-950/80 space-y-4">
            <h3 className="text-lg font-bold text-white font-mono uppercase">
              Your Published Digital Assets
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3">Asset Title</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">License</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Sales</th>
                    <th className="pb-3">File Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map((p) => (
                    <tr key={p.id} className="text-slate-300">
                      <td className="py-3 font-bold text-white flex items-center gap-2">
                        <img src={p.thumbnail} alt="" className="w-8 h-8 rounded object-cover" />
                        <span>{p.title}</span>
                      </td>
                      <td className="py-3 text-cyan-400">{p.category}</td>
                      <td className="py-3">{p.licenseType}</td>
                      <td className="py-3 font-bold text-emerald-400">${p.price.toFixed(2)}</td>
                      <td className="py-3">{p.salesCount}</td>
                      <td className="py-3 text-slate-400">{p.fileSize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT TAB */}
      {activeTab === "add-product" && (
        <form
          onSubmit={handleCreateProduct}
          className="p-8 rounded-3xl bg-[#0d1322] border border-amber-500/40 space-y-6 max-w-2xl mx-auto animate-in fade-in"
        >
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
            <PlusCircle className="w-4 h-4" />
            <span>Publish New Creator Asset</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Product Title</label>
              <input
                type="text"
                required
                value={prodTitle}
                onChange={(e) => setProdTitle(e.target.value)}
                placeholder="e.g. Procedural Dungeon Generator Plugin"
                className="w-full p-3 rounded-xl bg-[#090d16] border border-slate-800 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Category</label>
                <select
                  value={prodCategory}
                  onChange={(e: any) => setProdCategory(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#090d16] border border-slate-800 text-white focus:outline-none"
                >
                  <option value="Game Assets">Game Assets</option>
                  <option value="UI Kits">UI Kits</option>
                  <option value="Source Code">Source Code</option>
                  <option value="Plugins">Plugins</option>
                  <option value="3D Models">3D Models</option>
                  <option value="Templates">Templates</option>
                  <option value="Minecraft Resources">Minecraft Resources</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Price ($ USD, 0 for Free)</label>
                <input
                  type="number"
                  step="0.01"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 rounded-xl bg-[#090d16] border border-slate-800 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Package File Name</label>
                <input
                  type="text"
                  value={prodFileName}
                  onChange={(e) => setProdFileName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#090d16] border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">File Size</label>
                <input
                  type="text"
                  value={prodFileSize}
                  onChange={(e) => setProdFileSize(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#090d16] border border-slate-800 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Description</label>
              <textarea
                rows={3}
                value={prodDesc}
                onChange={(e) => setProdDesc(e.target.value)}
                placeholder="Features, engine compatibility, licensing..."
                className="w-full p-3 rounded-xl bg-[#090d16] border border-slate-800 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono uppercase shadow-lg"
            >
              Publish to Store
            </button>
          </div>
        </form>
      )}

      {/* ADD GAME TAB */}
      {activeTab === "add-game" && (
        <form
          onSubmit={handleCreateGame}
          className="p-8 rounded-3xl bg-[#0d1322] border border-cyan-500/40 space-y-6 max-w-2xl mx-auto animate-in fade-in"
        >
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
            <PlusCircle className="w-4 h-4" />
            <span>Host New Playable Game Package</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Game Title</label>
              <input
                type="text"
                required
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
                placeholder="e.g. Chrono Blade: Rebirth"
                className="w-full p-3 rounded-xl bg-[#090d16] border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Category</label>
                <select
                  value={gameCategory}
                  onChange={(e: any) => setGameCategory(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#090d16] border border-slate-800 text-white focus:outline-none"
                >
                  <option value="Action">Action</option>
                  <option value="RPG">RPG</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Racing">Racing</option>
                  <option value="Sandbox">Sandbox</option>
                  <option value="Indie">Indie</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Version</label>
                <input
                  type="text"
                  value={gameVersion}
                  onChange={(e) => setGameVersion(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#090d16] border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Game File Name (.zip, .exe, .rar)</label>
                <input
                  type="text"
                  value={gameFileName}
                  onChange={(e) => setGameFileName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#090d16] border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">File Size</label>
                <input
                  type="text"
                  value={gameFileSize}
                  onChange={(e) => setGameFileSize(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#090d16] border border-slate-800 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Price ($0 for Free to Play)</label>
              <input
                type="number"
                step="0.01"
                value={gamePrice}
                onChange={(e) => setGamePrice(parseFloat(e.target.value) || 0)}
                className="w-full p-3 rounded-xl bg-[#090d16] border border-slate-800 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Game Overview & Mechanics</label>
              <textarea
                rows={3}
                value={gameDesc}
                onChange={(e) => setGameDesc(e.target.value)}
                placeholder="Describe your game..."
                className="w-full p-3 rounded-xl bg-[#090d16] border border-slate-800 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono uppercase shadow-lg"
            >
              Deploy & Host Game
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
