import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Game } from "../types";
import {
  Gamepad2,
  Download,
  Star,
  HardDrive,
  Tag,
  Search,
  Filter,
  Flame,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Layers,
  Heart,
} from "lucide-react";

interface GamesCatalogProps {
  limit?: number;
  showTitle?: boolean;
}

export const GamesCatalog: React.FC<GamesCatalogProps> = ({ limit, showTitle = true }) => {
  const {
    games,
    setActiveView,
    setSelectedGameId,
    addToCart,
    generateSecureDownload,
    addNotification,
    wishlist,
    toggleWishlist,
    isInWishlist,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [filterType, setFilterType] = useState<"all" | "free" | "paid" | "featured">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "newest" | "price">("popular");
  const [activeDownloadModal, setActiveDownloadModal] = useState<Game | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadTokenData, setDownloadTokenData] = useState<{ token: string; url: string } | null>(null);

  const categories = ["All", "Action", "RPG", "Sci-Fi", "Strategy", "Racing", "Sandbox", "Indie"];

  const filteredGames = useMemo(() => {
    return games
      .filter((game) => {
        const matchesCat = selectedCategory === "All" || game.category === selectedCategory;
        const matchesFilter =
          filterType === "all" ||
          (filterType === "free" && game.isFree) ||
          (filterType === "paid" && !game.isFree) ||
          (filterType === "featured" && game.isFeatured);
        const matchesSearch =
          game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          game.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          game.developer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "popular") return b.downloadsCount - a.downloadsCount;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "newest") return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        if (sortBy === "price") return a.price - b.price;
        return 0;
      })
      .slice(0, limit || games.length);
  }, [games, selectedCategory, filterType, searchQuery, sortBy, limit]);

  const handleStartDownload = async (game: Game) => {
    setActiveDownloadModal(game);
    setDownloadProgress(10);
    const tokenInfo = await generateSecureDownload({
      id: game.id,
      title: game.title,
      fileName: game.fileName,
      fileSize: game.fileSize,
      fileUrl: game.fileUrl,
      type: "game",
    });

    setDownloadTokenData({ token: tokenInfo.token, url: tokenInfo.downloadUrl });

    // Simulate cryptographic verification & download initialization
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          addNotification({
            title: "💾 Download Initialized",
            message: `${game.title} payload securely tokenized and delivered.`,
            type: "download",
          });
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  return (
    <section id="games-catalog-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      {showTitle && (
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-500 font-mono text-xs tracking-widest uppercase mb-2 font-bold">
              <Gamepad2 className="w-4 h-4" />
              <span>VERIFIED GAME ARSENAL</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-mono uppercase tracking-tight">
              Hosted Game Vault
            </h2>
            <p className="text-white/60 mt-1 text-sm max-w-xl">
              Download playable game packages, test indie beta builds, and access standalone releases via high-speed encrypted distribution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider font-bold">
              Showing <span className="text-orange-500">{filteredGames.length}</span> Games
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar Controls */}
      <div id="games-filter-bar" className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md mb-8 flex flex-col lg:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search game, tag, developer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/40 text-xs focus:outline-none focus:border-orange-500 transition-all font-mono"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                  : "bg-black/30 text-white/60 hover:text-white hover:bg-white/5 border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Free / Paid / Sort Controls */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white/70 text-xs focus:outline-none font-mono"
          >
            <option value="all">All Pricing</option>
            <option value="free">Free Downloads</option>
            <option value="paid">Premium Games</option>
            <option value="featured">🔥 Featured</option>
          </select>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white/70 text-xs focus:outline-none font-mono"
          >
            <option value="popular">Most Downloaded</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Latest Releases</option>
            <option value="price">Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Games Grid */}
      <div id="games-card-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            id={`game-card-${game.id}`}
            className="group relative rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/40 hover:bg-white/[0.07] backdrop-blur-md transition-all duration-300 overflow-hidden flex flex-col shadow-xl hover:-translate-y-1"
          >
            {/* Game Cover & Overlay */}
            <div className="relative h-52 w-full overflow-hidden bg-neutral-900">
              <img
                src={game.coverImage}
                alt={game.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/30 to-black/40" />

              {/* Badges on Cover & Wishlist Button */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-black/70 border border-white/10 text-orange-400 text-[10px] font-bold font-mono uppercase tracking-wider backdrop-blur-md">
                    {game.category}
                  </span>
                  {game.isFeatured && (
                    <span className="px-2.5 py-1 rounded-md bg-orange-600 text-black text-[10px] font-black font-mono uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-3 h-3 text-black fill-black" /> Featured
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(game.id, game.title);
                  }}
                  className={`pointer-events-auto p-2 rounded-xl border backdrop-blur-md transition-all ${
                    isInWishlist(game.id)
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : "bg-black/60 text-white/60 hover:text-white border-white/10"
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`w-3.5 h-3.5 ${isInWishlist(game.id) ? "fill-red-500 text-red-500" : ""}`} />
                </button>
              </div>

              {/* Version & File Size Pill */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono text-white/80">
                <span className="bg-black/80 px-2 py-0.5 rounded border border-white/10 text-[10px]">
                  v{game.version}
                </span>
                <span className="bg-black/80 px-2 py-0.5 rounded border border-white/10 flex items-center gap-1 text-orange-400 text-[10px]">
                  <HardDrive className="w-3 h-3" />
                  {game.fileSize}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-white/40 truncate max-w-[180px]">
                    By {game.developer}
                  </span>
                  <div className="flex items-center gap-1 text-orange-400 text-xs font-bold font-mono">
                    <Star className="w-3.5 h-3.5 fill-orange-400" />
                    <span>{game.rating.toFixed(1)}</span>
                    <span className="text-white/40 text-[10px]">({game.reviewsCount})</span>
                  </div>
                </div>

                <h3
                  onClick={() => {
                    setSelectedGameId(game.id);
                    setActiveView("game-detail");
                  }}
                  className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors cursor-pointer line-clamp-1 uppercase tracking-tight"
                >
                  {game.title}
                </h3>

                <p className="text-xs text-white/60 mt-2 line-clamp-2 leading-relaxed">
                  {game.description}
                </p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {game.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-black/40 text-white/40 text-[10px] font-mono border border-white/5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Price & Action Buttons */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  {game.isFree ? (
                    <span className="text-xs font-black text-orange-400 font-mono tracking-widest uppercase">
                      FREE DOWNLOAD
                    </span>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-white font-mono">
                        ${(game.discountPrice || game.price).toFixed(2)}
                      </span>
                      {game.discountPrice && (
                        <span className="text-xs line-through text-white/40 font-mono">
                          ${game.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedGameId(game.id);
                      setActiveView("game-detail");
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs border border-white/10"
                    title="View Details & Requirements"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  {game.isFree ? (
                    <button
                      onClick={() => handleStartDownload(game)}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-orange-500 hover:text-white text-black font-black uppercase text-xs tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        addToCart({
                          id: game.id,
                          title: game.title,
                          price: game.discountPrice || game.price,
                          thumbnail: game.coverImage,
                          type: "game",
                          fileName: game.fileName,
                          fileSize: game.fileSize,
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black uppercase text-xs tracking-wider flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <span>Buy Now</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secure Download Modal */}
      {activeDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0a0a0c]/95 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative backdrop-blur-xl">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 mb-4 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                <Download className="w-7 h-7 animate-bounce" />
              </div>

              <h3 className="text-xl font-bold text-white font-mono uppercase tracking-tight">
                {activeDownloadModal.title}
              </h3>
              <p className="text-xs text-white/60 mt-1 font-mono">
                Package: {activeDownloadModal.fileName} ({activeDownloadModal.fileSize})
              </p>

              {/* Verification Progress Bar */}
              <div className="mt-6 bg-black/60 p-4 rounded-xl border border-white/10 text-left">
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-white/60">
                    {downloadProgress < 100 ? "Validating Encrypted Token & Checksum..." : "Verified & Ready"}
                  </span>
                  <span className="text-orange-400 font-bold">{downloadProgress}%</span>
                </div>
                <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                {downloadTokenData && (
                  <div className="mt-3 text-[10px] text-white/40 font-mono break-all">
                    Encrypted Token: {downloadTokenData.token.slice(0, 16)}... (Valid for 30m)
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setActiveDownloadModal(null);
                    setDownloadProgress(0);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-mono border border-white/10"
                >
                  Close
                </button>
                {downloadProgress >= 100 && (
                  <a
                    href={downloadTokenData?.url || "#"}
                    download={activeDownloadModal.fileName}
                    onClick={() => {
                      setTimeout(() => setActiveDownloadModal(null), 1000);
                    }}
                    className="px-5 py-2 rounded-xl bg-white hover:bg-orange-500 hover:text-white text-black font-black uppercase text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.5)] font-mono transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Save Package
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
