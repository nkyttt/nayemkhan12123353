import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { UserRole, PERMISSION_DESCRIPTIONS } from "../types";
import {
  User,
  Download,
  Key,
  Heart,
  ShoppingBag,
  Shield,
  HardDrive,
  Copy,
  CheckCircle,
  ExternalLink,
  Trash2,
  ShoppingCart,
  Sparkles,
  Star,
  Check,
  Lock,
  ArrowRight,
  RefreshCw,
  Box,
  Gamepad2,
  Store,
  Layers,
} from "lucide-react";

export const UserDashboard: React.FC = () => {
  const {
    currentUser,
    currentRole,
    setCurrentRole,
    rolePermissions,
    hasPermission,
    orders,
    wishlist,
    toggleWishlist,
    moveWishlistItemToCart,
    clearWishlist,
    games,
    products,
    setActiveView,
    setSelectedGameId,
    setSelectedProductId,
    addToCart,
    setIsCartOpen,
    generateSecureDownload,
    addNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "rbac">("orders");
  const [wishlistFilter, setWishlistFilter] = useState<"all" | "games" | "products">("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const userOrders = orders;

  const wishlistGames = games.filter((g) => wishlist.includes(g.id));
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const filteredWishlistItems = [
    ...(wishlistFilter === "all" || wishlistFilter === "games"
      ? wishlistGames.map((g) => ({ ...g, itemType: "game" as const }))
      : []),
    ...(wishlistFilter === "all" || wishlistFilter === "products"
      ? wishlistProducts.map((p) => ({ ...p, itemType: "product" as const }))
      : []),
  ];

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    addNotification({
      title: "📋 License Key Copied",
      message: "Key saved to clipboard.",
      type: "system",
    });
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleFreeDownload = async (item: any) => {
    const tokenInfo = await generateSecureDownload({
      id: item.id,
      title: item.title,
      fileName: item.fileName,
      fileSize: item.fileSize,
      fileUrl: item.fileUrl,
      type: item.itemType || (item.category && item.screenshots ? "game" : "product"),
    });

    const link = document.createElement("a");
    link.href = tokenInfo.downloadUrl;
    link.download = item.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification({
      title: "⚡ Direct Download Initiated",
      message: `${item.title} package downloaded.`,
      type: "download",
    });
  };

  const handleMoveAllToCart = () => {
    filteredWishlistItems.forEach((item: any) => {
      addToCart({
        id: item.id,
        title: item.title,
        price: item.isFree ? 0 : item.discountPrice || item.price,
        thumbnail: item.coverImage || item.thumbnail,
        type: item.itemType,
        fileName: item.fileName,
        fileSize: item.fileSize,
      });
    });
    clearWishlist();
    setIsCartOpen(true);
    addNotification({
      title: "🛒 Moved All to Cart",
      message: `${filteredWishlistItems.length} wishlist items transferred to cart.`,
      type: "order",
    });
  };

  const activePermissions = rolePermissions[currentRole] || [];

  return (
    <div id="user-dashboard-page" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* User Header Profile Card */}
      <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-600 p-[2px] shadow-[0_0_25px_rgba(249,115,22,0.4)]">
            <div className="w-full h-full rounded-[14px] bg-[#09090b] flex items-center justify-center text-2xl font-black text-white font-mono">
              {currentUser?.displayName ? currentUser.displayName.charAt(0) : "P"}
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-white font-mono uppercase tracking-tight">
                {currentUser?.displayName || "Alpha Commander"}
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-mono font-bold border border-orange-500/30 uppercase tracking-wider">
                {currentRole} Role Active
              </span>
            </div>
            <p className="text-xs text-white/60 font-mono mt-1">
              {currentUser?.email || "gamer@gamehubcxt.io"}
            </p>
          </div>
        </div>

        {/* Top Summary Stats */}
        <div className="flex items-center gap-3 text-center font-mono">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 min-w-[110px]">
            <span className="text-2xl font-black text-white">{userOrders.length}</span>
            <span className="text-[10px] text-white/50 uppercase tracking-wider block mt-0.5 font-bold">
              Orders Vault
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 min-w-[110px]">
            <span className="text-2xl font-black text-orange-400">{wishlist.length}</span>
            <span className="text-[10px] text-white/50 uppercase tracking-wider block mt-0.5 font-bold">
              Wishlist Items
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 min-w-[110px]">
            <span className="text-2xl font-black text-emerald-400">{activePermissions.length}</span>
            <span className="text-[10px] text-white/50 uppercase tracking-wider block mt-0.5 font-bold">
              Permissions
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none font-mono text-xs">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === "orders"
              ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]"
              : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders & Keys ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("wishlist")}
          className={`px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === "wishlist"
              ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]"
              : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Personal Wishlist ({wishlist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("rbac")}
          className={`px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === "rbac"
              ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]"
              : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>RBAC Permissions Matrix</span>
        </button>
      </div>

      {/* 1. ORDERS & KEYS TAB */}
      {activeTab === "orders" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-orange-400 uppercase tracking-wider font-bold">
                ENCRYPTED STORAGE
              </span>
              <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tight">
                Purchased Games & License Vault
              </h2>
            </div>
          </div>

          {userOrders.length === 0 ? (
            <div className="p-16 rounded-3xl bg-white/5 border border-white/10 text-center space-y-4 font-mono text-xs text-white/50 backdrop-blur-md">
              <ShoppingBag className="w-12 h-12 text-white/20 mx-auto" />
              <p className="text-sm text-white/80 font-bold">You have not placed any orders yet.</p>
              <p className="max-w-md mx-auto">Explore high-octane indie games or equip your game studio with source assets and shaders.</p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveView("games")}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold uppercase"
                >
                  Explore Games
                </button>
                <button
                  onClick={() => setActiveView("store")}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase"
                >
                  Browse Store
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 shadow-xl backdrop-blur-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2 font-mono text-xs">
                    <div>
                      <span className="text-white/50">Order ID: </span>
                      <strong className="text-orange-400">{order.id}</strong>
                    </div>
                    <div className="flex items-center gap-4 text-white/60">
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        ${order.totalAmount.toFixed(2)} Paid ({order.paymentMethod})
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-white font-mono uppercase">{item.title}</h4>
                            <span className="text-[11px] text-white/40 font-mono">
                              File: {item.fileName} ({item.fileSize})
                            </span>
                          </div>
                          <span className="text-xs font-bold text-orange-400 font-mono">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>

                        {/* License Key box */}
                        {order.licenseKeys?.[item.id] && (
                          <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between text-xs font-mono">
                            <span className="text-amber-400 truncate pr-2 font-bold">
                              Key: {order.licenseKeys[item.id]}
                            </span>
                            <button
                              onClick={() => handleCopy(order.licenseKeys[item.id])}
                              className="p-1 text-white/50 hover:text-white transition-colors"
                              title="Copy License Key"
                            >
                              {copiedKey === order.licenseKeys[item.id] ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleFreeDownload(item)}
                            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black text-xs font-mono uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all"
                          >
                            <Download className="w-3.5 h-3.5" /> Download Package
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. WISHLIST TAB */}
      {activeTab === "wishlist" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-orange-400 uppercase tracking-wider font-bold">
                SAVED FOR LATER
              </span>
              <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tight">
                My Saved Wishlist ({wishlist.length})
              </h2>
            </div>

            {/* Wishlist Filters & Batch Actions */}
            {wishlist.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
                  <button
                    onClick={() => setWishlistFilter("all")}
                    className={`px-3 py-1 rounded-lg font-bold uppercase ${
                      wishlistFilter === "all" ? "bg-orange-500 text-black" : "text-white/60 hover:text-white"
                    }`}
                  >
                    All ({wishlist.length})
                  </button>
                  <button
                    onClick={() => setWishlistFilter("games")}
                    className={`px-3 py-1 rounded-lg font-bold uppercase ${
                      wishlistFilter === "games" ? "bg-orange-500 text-black" : "text-white/60 hover:text-white"
                    }`}
                  >
                    Games ({wishlistGames.length})
                  </button>
                  <button
                    onClick={() => setWishlistFilter("products")}
                    className={`px-3 py-1 rounded-lg font-bold uppercase ${
                      wishlistFilter === "products" ? "bg-orange-500 text-black" : "text-white/60 hover:text-white"
                    }`}
                  >
                    Store ({wishlistProducts.length})
                  </button>
                </div>

                <button
                  onClick={handleMoveAllToCart}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-orange-500 hover:text-white text-black font-bold uppercase flex items-center gap-1.5 shadow-md transition-all"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Move All to Cart
                </button>

                <button
                  onClick={clearWishlist}
                  className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 border border-white/10 transition-all"
                  title="Clear Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {filteredWishlistItems.length === 0 ? (
            <div className="p-16 rounded-3xl bg-white/5 border border-white/10 text-center space-y-4 font-mono text-xs text-white/50 backdrop-blur-md">
              <Heart className="w-12 h-12 text-white/20 mx-auto" />
              <p className="text-sm text-white/80 font-bold">Your wishlist is currently empty.</p>
              <p className="max-w-md mx-auto">
                Bookmark exciting games and digital developer assets with the heart icon to save them for later or checkout when on sale.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveView("games")}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold uppercase"
                >
                  Browse Games
                </button>
                <button
                  onClick={() => setActiveView("store")}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase"
                >
                  Explore Store Assets
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWishlistItems.map((item: any) => {
                const isGame = item.itemType === "game";
                return (
                  <div
                    key={item.id}
                    id={`wishlist-card-${item.id}`}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/40 backdrop-blur-md transition-all flex flex-col justify-between space-y-4 shadow-xl"
                  >
                    <div>
                      {/* Image & Badges */}
                      <div className="relative h-44 w-full rounded-xl overflow-hidden mb-3 bg-neutral-900 border border-white/10">
                        <img
                          src={item.coverImage || item.thumbnail}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-orange-400 text-[10px] font-mono font-bold uppercase">
                          {isGame ? "Game" : "Store Asset"} • {item.category}
                        </span>

                        <button
                          onClick={() => toggleWishlist(item.id, item.title)}
                          className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-black/70 hover:bg-red-600 text-red-400 hover:text-white border border-white/10 transition-all"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="flex items-center justify-between mb-1 text-xs font-mono">
                        <div className="flex items-center gap-1 text-orange-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-orange-400" />
                          <span>{item.rating?.toFixed(1) || "5.0"}</span>
                          <span className="text-white/40">({item.reviewsCount || 0})</span>
                        </div>
                        <span className="text-white/40 text-[11px]">{item.fileSize}</span>
                      </div>

                      <h3
                        onClick={() => {
                          if (isGame) {
                            setSelectedGameId(item.id);
                            setActiveView("game-detail");
                          } else {
                            setSelectedProductId(item.id);
                            setActiveView("store");
                          }
                        }}
                        className="text-base font-bold text-white uppercase tracking-tight line-clamp-1 hover:text-orange-400 cursor-pointer transition-colors"
                      >
                        {item.title}
                      </h3>

                      <p className="text-xs text-white/60 line-clamp-2 mt-1.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between font-mono">
                      <div>
                        {item.isFree ? (
                          <span className="text-xs font-black text-orange-400 uppercase">FREE</span>
                        ) : (
                          <span className="text-base font-black text-white">
                            ${(item.discountPrice || item.price).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {item.isFree ? (
                          <button
                            onClick={() => handleFreeDownload(item)}
                            className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(249,115,22,0.3)] transition-all"
                          >
                            <Download className="w-3.5 h-3.5" /> Get Free
                          </button>
                        ) : (
                          <button
                            onClick={() => moveWishlistItemToCart(item.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-orange-500 hover:text-white text-black font-black uppercase text-xs flex items-center gap-1.5 shadow-md transition-all"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. RBAC PERMISSIONS TAB */}
      {activeTab === "rbac" && (
        <div className="space-y-8 animate-in fade-in font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-orange-400 uppercase tracking-wider font-bold">
                SECURITY ARCHITECTURE
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Active Role-Based Access Control (RBAC)
              </h2>
              <p className="text-white/60 mt-1 max-w-xl text-xs">
                Your account is currently authorized under the <strong>{currentRole}</strong> tier with {activePermissions.length} granular security capabilities.
              </p>
            </div>

            {/* Quick Role Switcher for Testing */}
            <div className="flex items-center gap-2">
              <span className="text-white/40 uppercase">Switch Active Role:</span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-orange-400 font-bold focus:outline-none"
              >
                <option value="CUSTOMER">Customer / Gamer</option>
                <option value="CREATOR">Creator / Publisher</option>
                <option value="ADMIN">Admin Manager</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="OWNER">Platform Owner</option>
              </select>
            </div>
          </div>

          {/* Granular Permissions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(PERMISSION_DESCRIPTIONS).map(([permKey, permMeta]) => {
              const isAllowed = hasPermission(permKey as any);
              return (
                <div
                  key={permKey}
                  className={`p-4 rounded-2xl border transition-all ${
                    isAllowed
                      ? "bg-orange-500/10 border-orange-500/30 text-white"
                      : "bg-black/40 border-white/5 text-white/40 opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-orange-400/80 block">
                        {permMeta.category}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{permMeta.label}</h4>
                    </div>
                    {isAllowed ? (
                      <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-lg bg-white/5 text-white/30 border border-white/10">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">{permMeta.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
