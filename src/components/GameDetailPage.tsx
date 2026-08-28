import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Game } from "../types";
import {
  Gamepad2,
  Download,
  Star,
  HardDrive,
  Cpu,
  Monitor,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowLeft,
  Share2,
  MessageSquare,
  Play,
  History,
  FileCheck,
  Heart,
  ThumbsUp,
  ShieldAlert,
  Trash2,
  EyeOff,
  Check,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export const GameDetailPage: React.FC = () => {
  const {
    games,
    selectedGameId,
    setActiveView,
    addToCart,
    reviews,
    addReview,
    updateReviewStatus,
    deleteReview,
    voteHelpful,
    hasPermission,
    currentRole,
    currentUser,
    wishlist,
    toggleWishlist,
    isInWishlist,
    generateSecureDownload,
    addNotification,
  } = useApp();

  const game = games.find((g) => g.id === selectedGameId) || games[0];

  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "versions" | "reviews">("overview");
  const [selectedScreenshot, setSelectedScreenshot] = useState<string>(game.screenshots[0] || game.coverImage);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState<string>("");
  const [userComment, setUserComment] = useState<string>("");
  const [isVerifiedBuyer, setIsVerifiedBuyer] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");

  const canModerate = hasPermission("moderate_reviews") || currentRole === "ADMIN" || currentRole === "SUPER_ADMIN" || currentRole === "OWNER";

  // Filter reviews for this game
  const allGameReviews = reviews.filter((r) => r.targetType === "game" && r.targetId === game.id);
  const visibleGameReviews = allGameReviews.filter((r) => {
    if (!canModerate && r.status === "hidden") return false;
    if (ratingFilter !== "all" && r.rating !== ratingFilter) return false;
    return true;
  });

  // Calculate rating statistics
  const totalReviews = allGameReviews.length;
  const avgRating =
    totalReviews > 0
      ? (allGameReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : game.rating.toFixed(1);

  const starCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = allGameReviews.filter((r) => r.rating === stars).length;
    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : stars === 5 ? 80 : 10;
    return { stars, count, pct };
  });

  const handleDownload = async () => {
    setDownloading(true);
    const tokenInfo = await generateSecureDownload({
      id: game.id,
      title: game.title,
      fileName: game.fileName,
      fileSize: game.fileSize,
      fileUrl: game.fileUrl,
      type: "game",
    });
    setDownloadUrl(tokenInfo.downloadUrl);
    setDownloading(false);
    addNotification({
      title: "⚡ Secure Download Ready",
      message: `Expiring token for ${game.title} generated (30 min expiry).`,
      type: "download",
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) return;

    await addReview({
      targetType: "game",
      targetId: game.id,
      targetTitle: game.title,
      userId: currentUser?.uid || "guest-user",
      userName: currentUser?.displayName || "CyberGamer_99",
      rating: userRating,
      title: reviewTitle.trim() || undefined,
      comment: userComment.trim(),
      isVerifiedPurchase: isVerifiedBuyer,
      status: "approved",
    });

    setUserComment("");
    setReviewTitle("");
    setActiveTab("reviews");
  };

  const isFavorited = isInWishlist(game.id);

  return (
    <div id="game-detail-page" className="min-h-screen pb-20">
      {/* Top Banner Header */}
      <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-neutral-950 border-b border-white/10">
        <img
          src={game.bannerImage || game.coverImage}
          alt={game.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/70 to-transparent" />

        {/* Back and Action Buttons */}
        <div className="absolute top-6 left-4 sm:left-8 right-4 sm:right-8 max-w-7xl mx-auto flex items-center justify-between z-20">
          <button
            onClick={() => setActiveView("games")}
            className="px-4 py-2 rounded-xl bg-black/60 text-white/80 hover:text-white border border-white/10 flex items-center gap-2 text-xs font-mono backdrop-blur-md transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Vault
          </button>

          <button
            onClick={() => toggleWishlist(game.id, game.title)}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase flex items-center gap-2 backdrop-blur-md border transition-all ${
              isFavorited
                ? "bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                : "bg-black/60 text-white/70 hover:text-white border-white/10"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
            <span>{isFavorited ? "In Wishlist" : "Add to Wishlist"}</span>
          </button>
        </div>

        {/* Banner Title Overlay */}
        <div className="absolute bottom-6 left-4 sm:left-8 right-4 sm:right-8 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 z-20">
          <div className="flex items-end gap-5">
            <img
              src={game.coverImage}
              alt={game.title}
              referrerPolicy="no-referrer"
              className="w-24 h-32 sm:w-32 sm:h-44 object-cover rounded-2xl border-2 border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.3)] shrink-0 hidden sm:block"
            />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs font-mono font-bold border border-orange-500/30 uppercase">
                  {game.category}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-white/10 text-white/80 text-xs font-mono">
                  v{game.version}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white font-mono uppercase tracking-tight">
                {game.title}
              </h1>
              <p className="text-xs sm:text-sm text-white/60 mt-1 font-mono">
                Developed by <span className="text-orange-400 font-bold">{game.developer}</span> • Released {game.releaseDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("reviews")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/80 border border-white/10 text-orange-400 font-mono text-sm hover:border-orange-500/40 transition-colors"
            >
              <Star className="w-4 h-4 fill-orange-400" />
              <span className="font-bold">{avgRating}</span>
              <span className="text-white/40 text-xs">({allGameReviews.length} reviews)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Tabs & Media Gallery */}
        <div className="lg:col-span-2 space-y-6">
          {/* Nav Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto font-mono text-xs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl font-bold uppercase transition-all ${
                activeTab === "overview"
                  ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              Overview & Media
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-4 py-2 rounded-xl font-bold uppercase transition-all ${
                activeTab === "specs"
                  ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              System Requirements
            </button>
            <button
              onClick={() => setActiveTab("versions")}
              className={`px-4 py-2 rounded-xl font-bold uppercase transition-all ${
                activeTab === "versions"
                  ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              Patch History ({game.changelog?.length || 1})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-2 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 ${
                activeTab === "reviews"
                  ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Reviews & Ratings ({allGameReviews.length})</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in">
              {/* Media Player Showcase */}
              <div className="space-y-3">
                <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 group shadow-2xl">
                  {isPlayingTrailer && game.trailerUrl ? (
                    <iframe
                      src={`${game.trailerUrl}?autoplay=1`}
                      title="Game Trailer"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <img
                        src={selectedScreenshot}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {game.trailerUrl && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setIsPlayingTrailer(true)}
                            className="p-4 rounded-full bg-orange-500 text-black hover:scale-110 transition-transform shadow-[0_0_30px_rgba(249,115,22,0.6)]"
                          >
                            <Play className="w-8 h-8 fill-black" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Screenshot Thumbnails */}
                {game.screenshots && game.screenshots.length > 0 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {game.screenshots.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedScreenshot(s);
                          setIsPlayingTrailer(false);
                        }}
                        className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                          selectedScreenshot === s && !isPlayingTrailer
                            ? "border-orange-500 scale-105 shadow-[0_0_12px_rgba(249,115,22,0.5)]"
                            : "border-white/10 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={s} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Game Story / Description */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 backdrop-blur-md">
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-tight">About {game.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed font-sans">{game.description}</p>
                {game.features && (
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <span className="text-xs font-mono font-bold text-orange-400 uppercase">Core Features</span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/80 font-mono">
                      {game.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SPECS */}
          {activeTab === "specs" && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6 backdrop-blur-md font-mono text-xs animate-in fade-in">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <span className="text-orange-400 font-bold uppercase block pb-2 border-b border-white/10">
                    Minimum Requirements
                  </span>
                  <div><strong className="text-white/40">OS:</strong> <span className="text-white">{game.systemRequirements?.os || "Windows 10 64-bit"}</span></div>
                  <div><strong className="text-white/40">CPU:</strong> <span className="text-white">{game.systemRequirements?.processor || "Intel Core i5-6600K / AMD Ryzen 5 1600"}</span></div>
                  <div><strong className="text-white/40">RAM:</strong> <span className="text-white">{game.systemRequirements?.memory || "8 GB RAM"}</span></div>
                  <div><strong className="text-white/40">GPU:</strong> <span className="text-white">{game.systemRequirements?.graphics || "NVIDIA GTX 1060 6GB / AMD RX 580"}</span></div>
                  <div><strong className="text-white/40">Storage:</strong> <span className="text-white">{game.systemRequirements?.storage || "15 GB available space"}</span></div>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <span className="text-emerald-400 font-bold uppercase block pb-2 border-b border-white/10">
                    Recommended (120+ FPS)
                  </span>
                  <div><strong className="text-white/40">OS:</strong> <span className="text-white">Windows 11 64-bit</span></div>
                  <div><strong className="text-white/40">CPU:</strong> <span className="text-white">Intel Core i7-12700K / Ryzen 7 7800X3D</span></div>
                  <div><strong className="text-white/40">RAM:</strong> <span className="text-white">16 GB DDR5</span></div>
                  <div><strong className="text-white/40">GPU:</strong> <span className="text-white">RTX 3070 8GB / RX 6800 XT</span></div>
                  <div><strong className="text-white/40">Storage:</strong> <span className="text-white">NVMe M.2 SSD</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VERSIONS */}
          {activeTab === "versions" && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 backdrop-blur-md font-mono text-xs animate-in fade-in">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Release & Patch History</h3>
              <div className="space-y-3">
                {game.changelog && game.changelog.length > 0 ? (
                  game.changelog.map((c, i) => (
                    <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-orange-400">Version {c.version}</strong>
                        <span className="text-white/40">{c.date}</span>
                      </div>
                      <p className="text-white/70">{c.changes}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                    <strong className="text-orange-400">Version {game.version} (Launch Release)</strong>
                    <p className="text-white/70 mt-1">Official platform release build with full singleplayer & multiplayer modules.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS & RATINGS */}
          {activeTab === "reviews" && (
            <div className="space-y-8 animate-in fade-in">
              {/* Rating Summary Card */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="text-center md:border-r md:border-white/10 pr-4 space-y-1">
                  <div className="text-5xl font-black text-orange-400 font-mono tracking-tight">{avgRating}</div>
                  <div className="flex justify-center gap-1 text-orange-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(Number(avgRating)) ? "fill-orange-400" : "text-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/50 font-mono mt-1">Based on {allGameReviews.length} reviews</p>
                </div>

                {/* Rating Distribution Bars */}
                <div className="md:col-span-2 space-y-2 font-mono text-xs">
                  {starCounts.map((sc) => (
                    <div
                      key={sc.stars}
                      onClick={() => setRatingFilter(ratingFilter === sc.stars ? "all" : sc.stars)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <span className="w-12 text-white/60 font-bold group-hover:text-orange-400">
                        {sc.stars} Star
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all"
                          style={{ width: `${sc.pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-white/40">{sc.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Write Review Form */}
              <form
                onSubmit={handleReviewSubmit}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 backdrop-blur-md font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase text-orange-400 font-bold">Write a Player Review</span>
                  <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVerifiedBuyer}
                      onChange={(e) => setIsVerifiedBuyer(e.target.checked)}
                      className="rounded accent-orange-500"
                    />
                    <span>Verified Player Review</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50 mr-2">Your Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= userRating
                            ? "fill-orange-400 text-orange-400"
                            : "text-white/20 hover:text-orange-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-orange-400 font-bold ml-2">
                    {userRating}.0 / 5.0 Rating
                  </span>
                </div>

                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Review Headline (e.g., 'Incredible gunplay and zero stutter!')"
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-orange-500"
                />

                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Share your gameplay experience, mechanics feedback, or tips for other players..."
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-orange-500"
                  rows={3}
                  required
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all"
                  >
                    Publish Review
                  </button>
                </div>
              </form>

              {/* Review Filter Bar */}
              <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-white/10">
                <span className="text-white/60">
                  Showing {visibleGameReviews.length} of {allGameReviews.length} reviews
                  {ratingFilter !== "all" && ` (Filtered by ${ratingFilter}★)`}
                </span>
                {ratingFilter !== "all" && (
                  <button
                    onClick={() => setRatingFilter("all")}
                    className="text-orange-400 hover:underline"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {visibleGameReviews.length === 0 ? (
                  <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center font-mono text-xs text-white/40">
                    No reviews matching criteria.
                  </div>
                ) : (
                  visibleGameReviews.map((r) => (
                    <div
                      key={r.id}
                      className={`p-5 rounded-2xl border backdrop-blur-md space-y-3 transition-all ${
                        r.status === "hidden"
                          ? "bg-red-950/20 border-red-500/30 opacity-60"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-mono font-bold text-orange-400 uppercase text-sm">
                            {r.userName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white font-mono">{r.userName}</span>
                              {r.isVerifiedPurchase && (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                                  Verified
                                </span>
                              )}
                              {r.status && r.status !== "approved" && (
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold uppercase">
                                  {r.status}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-white/40 font-mono">
                              {r.createdAt?.split("T")[0] || r.createdAt}
                            </span>
                          </div>
                        </div>

                        {/* Star Rating Badge */}
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-orange-400 text-xs font-mono">
                          <Star className="w-3.5 h-3.5 fill-orange-400" />
                          <span className="font-bold">{r.rating}.0</span>
                        </div>
                      </div>

                      {r.title && (
                        <h4 className="text-sm font-bold text-white font-mono">{r.title}</h4>
                      )}

                      <p className="text-xs text-white/80 leading-relaxed font-sans">{r.comment}</p>

                      {/* Footer Actions: Upvote & Moderator Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
                        <button
                          onClick={() => voteHelpful(r.id)}
                          className="flex items-center gap-1.5 text-white/50 hover:text-orange-400 transition-colors"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Helpful ({r.helpfulVotes || 0})</span>
                        </button>

                        {/* Moderator controls if permitted */}
                        {canModerate && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/40 uppercase">Mod:</span>
                            <button
                              onClick={() =>
                                updateReviewStatus(
                                  r.id,
                                  r.status === "hidden" ? "approved" : "hidden"
                                )
                              }
                              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 text-[10px]"
                            >
                              {r.status === "hidden" ? "Unhide" : "Hide"}
                            </button>
                            <button
                              onClick={() => deleteReview(r.id)}
                              className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400"
                              title="Delete Review"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: Package Info & Download Action Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(249,115,22,0.1)] space-y-6 sticky top-24 backdrop-blur-md">
            {/* Price Header */}
            <div>
              <span className="text-xs font-mono text-white/50 uppercase">License & Package</span>
              <div className="mt-1 flex items-baseline gap-2">
                {game.isFree ? (
                  <span className="text-2xl font-black text-orange-400 font-mono uppercase">
                    FREE PLAY EDITION
                  </span>
                ) : (
                  <>
                    <span className="text-3xl font-black text-white font-mono">
                      ${(game.discountPrice || game.price).toFixed(2)}
                    </span>
                    {game.discountPrice && (
                      <span className="text-sm line-through text-white/40 font-mono">
                        ${game.price.toFixed(2)}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {game.isFree ? (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.5)] transition-all font-mono"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloading ? "Generating Token..." : "Download Free Package"}</span>
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
                  className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all font-mono"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Add Game to Cart</span>
                </button>
              )}

              {/* Wishlist Toggle Button */}
              <button
                onClick={() => toggleWishlist(game.id, game.title)}
                className={`w-full py-3 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                  isFavorited
                    ? "bg-red-500/20 text-red-400 border-red-500/40"
                    : "bg-white/5 hover:bg-white/10 text-white/80 border-white/10"
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                <span>{isFavorited ? "In Your Wishlist" : "Save to Wishlist"}</span>
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={game.fileName}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 font-mono shadow-md animate-in fade-in"
                >
                  <CheckCircle2 className="w-4 h-4" /> Direct File Download Ready
                </a>
              )}
            </div>

            {/* Security Checklist */}
            <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs font-mono text-white/70">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                <span>Malware Scanned & Token Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Format: {game.fileType || ".zip"} ({game.fileSize})</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-400" />
                <span>{game.downloadsCount.toLocaleString()} Total Downloads</span>
              </div>
            </div>

            {/* Publisher Info */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono text-white/60 space-y-1">
              <div><strong className="text-white">Publisher:</strong> {game.publisher}</div>
              <div><strong className="text-white">License:</strong> Standard Digital Play License</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
