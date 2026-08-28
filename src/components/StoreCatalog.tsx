import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { DigitalProduct } from "../types";
import {
  Store,
  ShoppingCart,
  Star,
  HardDrive,
  Download,
  Filter,
  Check,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  Code,
  FileCode,
  Box,
  Heart,
  ThumbsUp,
  MessageSquare,
  Trash2,
} from "lucide-react";

interface StoreCatalogProps {
  limit?: number;
  showTitle?: boolean;
}

export const StoreCatalog: React.FC<StoreCatalogProps> = ({ limit, showTitle = true }) => {
  const {
    products,
    addToCart,
    setIsCartOpen,
    generateSecureDownload,
    addNotification,
    wishlist,
    toggleWishlist,
    isInWishlist,
    reviews,
    addReview,
    updateReviewStatus,
    deleteReview,
    voteHelpful,
    hasPermission,
    currentRole,
    currentUser,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [filterType, setFilterType] = useState<"all" | "free" | "paid" | "featured">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProductDetail, setSelectedProductDetail] = useState<DigitalProduct | null>(null);
  const [modalTab, setModalTab] = useState<"details" | "reviews">("details");
  const [selectedLicense, setSelectedLicense] = useState<"Personal" | "Commercial" | "Extended" | "Lifetime">("Commercial");

  // Review form states
  const [newRating, setNewRating] = useState<number>(5);
  const [newReviewTitle, setNewReviewTitle] = useState<string>("");
  const [newReviewComment, setNewReviewComment] = useState<string>("");

  const canModerate = hasPermission("moderate_reviews") || currentRole === "ADMIN" || currentRole === "SUPER_ADMIN" || currentRole === "OWNER";

  const categories = [
    "All",
    "Game Assets",
    "UI Kits",
    "Source Code",
    "Plugins",
    "3D Models",
    "Templates",
    "Minecraft Resources",
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        const matchesCat = selectedCategory === "All" || prod.category === selectedCategory;
        const matchesFilter =
          filterType === "all" ||
          (filterType === "free" && prod.isFree) ||
          (filterType === "paid" && !prod.isFree) ||
          (filterType === "featured" && prod.isFeatured);
        const matchesSearch =
          prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prod.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          prod.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesFilter && matchesSearch;
      })
      .slice(0, limit || products.length);
  }, [products, selectedCategory, filterType, searchQuery, limit]);

  const handleQuickFreeDownload = async (prod: DigitalProduct) => {
    const tokenInfo = await generateSecureDownload({
      id: prod.id,
      title: prod.title,
      fileName: prod.fileName,
      fileSize: prod.fileSize,
      fileUrl: prod.fileUrl,
      type: "product",
    });

    const link = document.createElement("a");
    link.href = tokenInfo.downloadUrl;
    link.download = prod.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification({
      title: "📦 Free Asset Downloaded",
      message: `${prod.title} package initiated.`,
      type: "download",
    });
  };

  const handleProductReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductDetail || !newReviewComment.trim()) return;

    await addReview({
      targetType: "product",
      targetId: selectedProductDetail.id,
      targetTitle: selectedProductDetail.title,
      userId: currentUser?.uid || "guest-dev",
      userName: currentUser?.displayName || "StudioArchitect",
      rating: newRating,
      title: newReviewTitle.trim() || undefined,
      comment: newReviewComment.trim(),
      isVerifiedPurchase: true,
      status: "approved",
    });

    setNewReviewTitle("");
    setNewReviewComment("");
    setModalTab("reviews");
  };

  // Product reviews
  const activeProductReviews = selectedProductDetail
    ? reviews.filter((r) => r.targetType === "product" && r.targetId === selectedProductDetail.id)
    : [];

  return (
    <section id="creator-store-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Title */}
      {showTitle && (
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-500 font-mono text-xs tracking-widest uppercase mb-2 font-bold">
              <Store className="w-4 h-4" />
              <span>DIGITAL DEVELOPER ARSENAL</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-mono uppercase tracking-tight">
              Creator & Game Store
            </h2>
            <p className="text-white/60 mt-1 text-sm max-w-xl">
              Equip your studio with production-ready game source code, custom shader graphs, rigged 3D models, and Figma UI systems.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-white/40 uppercase tracking-wider font-bold">
            <span>
              Available Items: <strong className="text-orange-500">{filteredProducts.length}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Filter and Category Navigation */}
      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md mb-8 flex flex-col lg:flex-row gap-4 justify-between items-center">
        {/* Categories */}
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

        {/* Free/Paid Filter */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white/70 text-xs focus:outline-none font-mono"
          >
            <option value="all">All Assets</option>
            <option value="free">Free Downloads</option>
            <option value="paid">Premium Assets</option>
            <option value="featured">⭐ Best Sellers</option>
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div id="store-product-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => {
          const isFavorited = isInWishlist(prod.id);
          return (
            <div
              key={prod.id}
              id={`product-card-${prod.id}`}
              className="group rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/40 hover:bg-white/[0.07] backdrop-blur-md transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl hover:-translate-y-1"
            >
              {/* Thumbnail & Wishlist Button */}
              <div className="relative h-48 w-full overflow-hidden bg-neutral-900">
                <img
                  src={prod.thumbnail}
                  alt={prod.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/80 text-orange-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-white/10">
                  {prod.category}
                </span>

                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(prod.id, prod.title);
                  }}
                  className={`absolute top-3 right-3 p-2 rounded-xl border backdrop-blur-md transition-all ${
                    isFavorited
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : "bg-black/60 text-white/60 hover:text-white border-white/10"
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                </button>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-1 text-orange-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-orange-400" />
                    <span>{prod.rating.toFixed(1)}</span>
                    <span className="text-white/40">({prod.reviewsCount})</span>
                  </div>
                  <span className="text-white/60 text-[11px]">{prod.fileSize}</span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => {
                      setSelectedProductDetail(prod);
                      setModalTab("details");
                    }}
                    className="text-base font-bold text-white font-mono uppercase tracking-tight group-hover:text-orange-400 transition-colors line-clamp-1 cursor-pointer"
                  >
                    {prod.title}
                  </h3>
                  <p className="text-xs text-white/60 line-clamp-2 mt-1 leading-relaxed font-sans">
                    {prod.description}
                  </p>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {prod.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-black/40 text-white/40 text-[10px] font-mono border border-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-4">
                  <div>
                    {prod.isFree ? (
                      <span className="text-xs font-black text-orange-400 font-mono uppercase tracking-widest">
                        FREE ASSET
                      </span>
                    ) : (
                      <div className="flex items-baseline gap-1.5 font-mono">
                        <span className="text-lg font-black text-white">
                          ${(prod.discountPrice || prod.price).toFixed(2)}
                        </span>
                        {prod.discountPrice && (
                          <span className="text-xs line-through text-white/40">
                            ${prod.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedProductDetail(prod);
                        setModalTab("details");
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs border border-white/10"
                      title="View Asset Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    {prod.isFree ? (
                      <button
                        onClick={() => handleQuickFreeDownload(prod)}
                        className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs font-mono flex items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Get Free</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          addToCart({
                            id: prod.id,
                            title: prod.title,
                            price: prod.discountPrice || prod.price,
                            thumbnail: prod.thumbnail,
                            type: "product",
                            fileName: prod.fileName,
                            fileSize: prod.fileSize,
                            licenseType: prod.licenseType,
                          });
                          setIsCartOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-orange-500 hover:text-white text-black font-black uppercase text-xs font-mono flex items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.2)] transition-all"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Detail Modal */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0a0a0c]/95 border border-white/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto backdrop-blur-xl">
            {/* Modal Header Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  onClick={() => setModalTab("details")}
                  className={`px-3 py-1.5 rounded-xl font-bold uppercase ${
                    modalTab === "details" ? "bg-orange-500 text-black" : "text-white/60 hover:text-white"
                  }`}
                >
                  Product Details
                </button>
                <button
                  onClick={() => setModalTab("reviews")}
                  className={`px-3 py-1.5 rounded-xl font-bold uppercase flex items-center gap-1.5 ${
                    modalTab === "reviews" ? "bg-orange-500 text-black" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>Reviews ({activeProductReviews.length})</span>
                </button>
              </div>

              <button
                onClick={() =>
                  toggleWishlist(selectedProductDetail.id, selectedProductDetail.title)
                }
                className={`p-2 rounded-xl border transition-all ${
                  isInWishlist(selectedProductDetail.id)
                    ? "bg-red-500/20 text-red-400 border-red-500/40"
                    : "bg-white/5 text-white/60 hover:text-white border-white/10"
                }`}
                title="Wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isInWishlist(selectedProductDetail.id) ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </button>
            </div>

            {/* TAB 1: PRODUCT DETAILS */}
            {modalTab === "details" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <img
                    src={selectedProductDetail.thumbnail}
                    alt={selectedProductDetail.title}
                    referrerPolicy="no-referrer"
                    className="w-full sm:w-56 h-48 sm:h-56 object-cover rounded-2xl border border-white/10 shrink-0"
                  />

                  <div className="space-y-3 flex-1">
                    <span className="px-2.5 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider">
                      {selectedProductDetail.category} (v{selectedProductDetail.version})
                    </span>
                    <h3 className="text-xl font-bold text-white font-mono uppercase tracking-tight">
                      {selectedProductDetail.title}
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed font-sans">
                      {selectedProductDetail.description}
                    </p>

                    <div className="pt-2 border-t border-white/10 text-xs font-mono text-white/50 space-y-1">
                      <div>Package: <span className="text-white">{selectedProductDetail.fileName}</span></div>
                      <div>Size: <span className="text-orange-400">{selectedProductDetail.fileSize}</span></div>
                      <div>Creator: <span className="text-white">{selectedProductDetail.creatorName}</span></div>
                    </div>
                  </div>
                </div>

                {/* License Selector */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <span className="text-xs font-mono text-white/40 uppercase tracking-wider block font-bold">
                    Select License Tier
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                    {(["Personal", "Commercial", "Extended", "Lifetime"] as const).map((lic) => (
                      <button
                        key={lic}
                        onClick={() => setSelectedLicense(lic)}
                        className={`p-2.5 rounded-xl border text-center transition-all uppercase tracking-wider font-bold ${
                          selectedLicense === lic
                            ? "border-orange-500 bg-orange-500/20 text-orange-400"
                            : "border-white/10 bg-black/40 text-white/50 hover:text-white"
                        }`}
                      >
                        {lic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: REVIEWS */}
            {modalTab === "reviews" && (
              <div className="space-y-6">
                {/* Write Review Form */}
                <form
                  onSubmit={handleProductReviewSubmit}
                  className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3 font-mono text-xs"
                >
                  <span className="text-xs font-bold text-orange-400 uppercase block">
                    Review this Asset
                  </span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewRating(s)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            s <= newRating
                              ? "fill-orange-400 text-orange-400"
                              : "text-white/20"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-orange-400 font-bold ml-2">{newRating}.0 / 5.0</span>
                  </div>

                  <input
                    type="text"
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    placeholder="Headline (e.g. 'Clean code structure and plug-and-play')"
                    className="w-full p-2.5 rounded-xl bg-black/80 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-orange-500"
                  />

                  <textarea
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Share feedback for developer and prospective buyers..."
                    className="w-full p-2.5 rounded-xl bg-black/80 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-orange-500"
                    rows={2}
                    required
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs shadow-md"
                    >
                      Post Review
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {activeProductReviews.length === 0 ? (
                    <div className="p-8 text-center text-xs font-mono text-white/40">
                      No reviews yet for this product. Be the first to leave one!
                    </div>
                  ) : (
                    activeProductReviews.map((r) => (
                      <div
                        key={r.id}
                        className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5 font-mono text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{r.userName}</span>
                          <div className="flex items-center gap-1 text-orange-400">
                            <Star className="w-3.5 h-3.5 fill-orange-400" />
                            <span>{r.rating}.0</span>
                          </div>
                        </div>
                        {r.title && <h5 className="text-white font-bold text-xs">{r.title}</h5>}
                        <p className="text-white/70 font-sans text-xs">{r.comment}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-white/40">
                          <button
                            onClick={() => voteHelpful(r.id)}
                            className="flex items-center gap-1 hover:text-orange-400"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Helpful ({r.helpfulVotes || 0})</span>
                          </button>

                          {canModerate && (
                            <button
                              onClick={() => deleteReview(r.id)}
                              className="text-red-400 hover:underline flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/10">
              <div className="font-mono">
                <span className="text-xs text-white/40 block uppercase">Price</span>
                <span className="text-2xl font-black text-white">
                  {selectedProductDetail.isFree
                    ? "FREE"
                    : `$${(selectedProductDetail.discountPrice || selectedProductDetail.price).toFixed(2)}`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedProductDetail(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-mono border border-white/10"
                >
                  Close
                </button>
                {selectedProductDetail.isFree ? (
                  <button
                    onClick={() => {
                      handleQuickFreeDownload(selectedProductDetail);
                      setSelectedProductDetail(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all"
                  >
                    <Download className="w-4 h-4" /> Download Free
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      addToCart({
                        id: selectedProductDetail.id,
                        title: selectedProductDetail.title,
                        price: selectedProductDetail.discountPrice || selectedProductDetail.price,
                        thumbnail: selectedProductDetail.thumbnail,
                        type: "product",
                        fileName: selectedProductDetail.fileName,
                        fileSize: selectedProductDetail.fileSize,
                        licenseType: selectedLicense,
                      });
                      setSelectedProductDetail(null);
                      setIsCartOpen(true);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-white hover:bg-orange-500 hover:text-white text-black font-black uppercase text-xs font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add with {selectedLicense} License
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
