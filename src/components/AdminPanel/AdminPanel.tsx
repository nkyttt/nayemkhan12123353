import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { SiteConfig, UserRole, Permission } from "../../types";
import { SEOSettingsPanel } from "./SEOSettingsPanel";
import {
  Shield,
  Palette,
  Layout,
  Gamepad2,
  Store,
  Code,
  DollarSign,
  Users,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Video,
  CheckCircle,
  AlertTriangle,
  Sliders,
  Send,
  Globe,
  Trash2,
  PlusCircle,
  ExternalLink,
  Star,
  MessageSquare,
  ShieldAlert,
  Check,
  EyeOff,
  Sparkles,
  Lock,
  Unlock,
  Key,
  Search,
} from "lucide-react";

const ALL_AVAILABLE_PERMISSIONS: { id: Permission; label: string; description: string; category: string }[] = [
  { id: "view_catalog", label: "Browse Catalog", description: "View hosted games and creator store assets", category: "General" },
  { id: "download_free", label: "Free Downloads", description: "Download free game binaries & asset files", category: "General" },
  { id: "purchase_items", label: "Purchase & Checkout", description: "Buy paid games and commercial license products", category: "General" },
  { id: "manage_wishlist", label: "Manage Wishlist", description: "Save & sync favorite games and products", category: "General" },
  { id: "submit_reviews", label: "Submit Reviews", description: "Post star ratings & comments on products", category: "Community" },
  { id: "view_orders", label: "View Own Orders", description: "Access personal purchase history & license keys", category: "General" },
  { id: "upload_games", label: "Upload Game Builds", description: "Publish new game binaries & release notes", category: "Creator" },
  { id: "manage_games", label: "Manage All Games", description: "Edit, update, and remove hosted game packages", category: "Admin" },
  { id: "upload_products", label: "Upload Digital Assets", description: "List shaders, 3D models, UI kits & plugins", category: "Creator" },
  { id: "manage_products", label: "Manage All Products", description: "Edit pricing, licenses, and store assets", category: "Admin" },
  { id: "view_creator_analytics", label: "Creator Analytics", description: "View seller revenue, downloads & metrics", category: "Creator" },
  { id: "access_creator_portal", label: "Access Creator Studio", description: "Manage creator profile, assets & listings", category: "Creator" },
  { id: "moderate_reviews", label: "Moderate Reviews", description: "Approve, flag, hide, or delete user reviews", category: "Admin" },
  { id: "view_all_orders", label: "View All Orders Vault", description: "Inspect platform transactions & order records", category: "Admin" },
  { id: "manage_site_settings", label: "Customize Website Design", description: "Change visual themes, video loops, hero & SEO", category: "Admin" },
  { id: "access_admin_panel", label: "Access Admin Suite", description: "Full back-office control panel access", category: "Admin" },
  { id: "manage_rbac", label: "Manage RBAC Matrix", description: "Configure role permissions dynamically", category: "Super Admin" },
  { id: "export_backups", label: "Export System Backups", description: "Download complete database JSON snapshots", category: "Super Admin" },
];

export const AdminPanel: React.FC = () => {
  const {
    siteConfig,
    updateSiteConfig,
    resetSiteConfig,
    games,
    addGame,
    updateGame,
    deleteGame,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    projects,
    addProject,
    deleteProject,
    orders,
    currentRole,
    setCurrentRole,
    rolePermissions,
    updateRolePermission,
    resetRolePermissions,
    hasPermission,
    reviews,
    updateReviewStatus,
    deleteReview,
    addNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "seo" | "appearance" | "hero" | "games" | "products" | "portfolio" | "orders" | "reviews" | "rbac" | "discord" | "backup"
  >("dashboard");

  // Local draft site config state for live previewing & instant saving
  const [draftConfig, setDraftConfig] = useState<SiteConfig>(siteConfig);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [discordTestStatus, setDiscordTestStatus] = useState<string | null>(null);

  // RBAC state
  const [selectedRbacRole, setSelectedRbacRole] = useState<UserRole>("ADMIN");

  // Review moderation filters
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>("all");
  const [reviewTargetFilter, setReviewTargetFilter] = useState<string>("all");

  // Quick check for Admin access
  const hasAdminAccess = hasPermission("access_admin_panel") || currentRole === "ADMIN" || currentRole === "SUPER_ADMIN" || currentRole === "OWNER";

  const handleSaveAppearance = async () => {
    await updateSiteConfig(draftConfig);
    setSaveSuccess(true);
    addNotification({
      title: "🎨 Appearance Saved",
      message: "Website visual theme and video background updated globally.",
      type: "system",
    });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveSeo = async () => {
    await updateSiteConfig(draftConfig);
    setSaveSuccess(true);
    addNotification({
      title: "🔍 SEO & Meta Tags Saved",
      message: "Global search engine tags, OpenGraph previews & sitemap settings updated.",
      type: "system",
    });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const backupData = {
      siteConfig,
      games,
      products,
      projects,
      orders,
      reviews,
      rolePermissions,
      timestamp: new Date().toISOString(),
      version: "GameHub-CXT-Backup-v2.0",
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GameHub_CXT_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addNotification({
      title: "💾 Backup Snapshot Exported",
      message: "Database, RBAC & appearance config downloaded as JSON.",
      type: "system",
    });
  };

  const handleTriggerDiscordTest = async () => {
    setDiscordTestStatus("Dispatching payload...");
    try {
      const res = await fetch("/api/discord/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: draftConfig.discordWebhookUrl,
          event: "ADMIN_SYSTEM_ALERT",
          title: "🎮 GameHub CXT • System Operational Test",
          description: "Discord webhook integration is functioning with active event listeners.",
          fields: [
            { name: "Server Status", value: "🟢 ONLINE (Port 3000)", inline: true },
            { name: "Live Games", value: `${games.length} Repositories`, inline: true },
            { name: "Store Assets", value: `${products.length} Products`, inline: true },
          ],
        }),
      });
      const data = await res.json();
      setDiscordTestStatus("✅ Discord notification payload generated successfully!");
    } catch (e: any) {
      setDiscordTestStatus(`❌ Discord Error: ${e.message}`);
    }
  };

  const themePresets = [
    { id: "immersive", label: "Immersive Obsidian (Active)", primary: "#f97316", accent: "#ea580c" },
    { id: "cyber", label: "Cyberpunk 2077", primary: "#00F0FF", accent: "#FF007F" },
    { id: "gaming", label: "Razer Gaming Green", primary: "#00FF66", accent: "#7928CA" },
    { id: "neon", label: "Synthwave Neon", primary: "#FF0055", accent: "#00E5FF" },
    { id: "dark", label: "Obsidian Stealth", primary: "#A855F7", accent: "#EC4899" },
  ];

  // Filtered reviews for moderation tab
  const filteredReviews = reviews.filter((r) => {
    if (reviewStatusFilter !== "all" && r.status !== reviewStatusFilter) return false;
    if (reviewTargetFilter !== "all" && r.targetType !== reviewTargetFilter) return false;
    return true;
  });

  if (!hasAdminAccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-900/90 border border-orange-500/30 text-center space-y-5 backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white font-mono uppercase tracking-tight">
              Admin Access Restricted
            </h2>
            <p className="text-xs text-white/60 font-sans leading-relaxed">
              Your current active role (<span className="text-orange-400 font-mono font-bold">{currentRole}</span>) lacks the <code className="text-orange-400">access_admin_panel</code> permission.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-3">
            <span className="text-[11px] text-white/40 font-mono block">Switch role for interactive preview:</span>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setCurrentRole("ADMIN")}
                className="px-4 py-2 rounded-xl bg-orange-500 text-black font-black text-xs font-mono uppercase tracking-wider hover:bg-orange-400 transition-all shadow-md"
              >
                Switch to Admin
              </button>
              <button
                onClick={() => setCurrentRole("OWNER")}
                className="px-4 py-2 rounded-xl bg-white/10 text-white font-mono text-xs uppercase hover:bg-white/20 transition-all"
              >
                Switch to Owner
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-panel-container" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-tight">
              Master Admin Suite & Studio
            </h1>
            <div className="flex items-center gap-2 text-xs text-white/40 font-mono mt-0.5">
              <span>Active Role:</span>
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                {currentRole}
              </span>
              <span>• Engine v2.6 Immersive</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/40 animate-in fade-in">
              <CheckCircle className="w-4 h-4" /> Global Settings Applied
            </span>
          )}
          <button
            onClick={handleSaveAppearance}
            className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-400 text-black font-black text-xs font-mono uppercase tracking-wider shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all"
          >
            Save All Settings
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Tabs + Content Area */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Tabs */}
        <div className="space-y-1.5 font-mono text-xs">
          {[
            { id: "dashboard", label: "Dashboard Overview", icon: Layout },
            { id: "seo", label: "SEO, Meta & Sitemap", icon: Search },
            { id: "appearance", label: "Theme & Video Customizer", icon: Palette },
            { id: "hero", label: "Hero & Page Builder", icon: Sliders },
            { id: "games", label: `Games Manager (${games.length})`, icon: Gamepad2 },
            { id: "products", label: `Digital Store (${products.length})`, icon: Store },
            { id: "portfolio", label: `Portfolio Projects (${projects.length})`, icon: Code },
            { id: "orders", label: `Orders Vault (${orders.length})`, icon: DollarSign },
            { id: "reviews", label: `Review Moderation (${reviews.length})`, icon: Star },
            { id: "rbac", label: "Role Permissions (RBAC)", icon: Users },
            { id: "discord", label: "Discord Webhook & Alerts", icon: Send },
            { id: "backup", label: "Backup & Maintenance", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 transition-all ${
                  activeTab === tab.id
                    ? "bg-orange-500 text-black font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${activeTab === tab.id ? "text-black" : "text-orange-400"}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Panels */}
        <div className="lg:col-span-3">
          {/* 1. DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-md">
                  <span className="text-xs text-white/50 uppercase">Total Hosted Games</span>
                  <div className="text-3xl font-black text-orange-400">{games.length}</div>
                  <span className="text-[10px] text-white/40">Playable & Standalone builds</span>
                </div>

                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-md">
                  <span className="text-xs text-white/50 uppercase">Digital Store Assets</span>
                  <div className="text-3xl font-black text-amber-400">{products.length}</div>
                  <span className="text-[10px] text-white/40">Shaders, UI Kits, Source Code</span>
                </div>

                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-md">
                  <span className="text-xs text-white/50 uppercase">Platform Revenue</span>
                  <div className="text-3xl font-black text-emerald-400">
                    ${orders.reduce((a, b) => a + b.totalAmount, 0).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-white/40">{orders.length} transactions processed</span>
                </div>
              </div>

              {/* Maintenance Mode Quick Card */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between font-mono backdrop-blur-md">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase">Maintenance Mode</h4>
                  <p className="text-xs text-white/60 mt-1">
                    When enabled, visitor traffic sees the customizable maintenance banner.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const toggled = !draftConfig.maintenanceMode;
                    setDraftConfig({ ...draftConfig, maintenanceMode: toggled });
                    updateSiteConfig({ maintenanceMode: toggled });
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider ${
                    draftConfig.maintenanceMode
                      ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {draftConfig.maintenanceMode ? "ACTIVE (OFFLINE)" : "NORMAL (LIVE)"}
                </button>
              </div>
            </div>
          )}

          {/* 2. SEO, OPENGRAPH & SITEMAP MODULE */}
          {activeTab === "seo" && (
            <div className="animate-in fade-in">
              <SEOSettingsPanel
                draftConfig={draftConfig}
                setDraftConfig={setDraftConfig}
                onSave={handleSaveSeo}
                saveSuccess={saveSuccess}
                games={games}
                products={products}
                projects={projects}
              />
            </div>
          )}

          {/* 3. REVIEWS MODERATION */}
          {activeTab === "reviews" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6 animate-in fade-in font-mono text-xs backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                    Community Reviews & Moderation
                  </h3>
                  <p className="text-white/50 text-[11px] mt-0.5">
                    Audit ratings, flag inappropriate content, or hide spam reviews across games & products.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={reviewStatusFilter}
                    onChange={(e) => setReviewStatusFilter(e.target.value)}
                    className="p-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs"
                  >
                    <option value="all">All Statuses</option>
                    <option value="approved">Approved Only</option>
                    <option value="pending">Pending</option>
                    <option value="flagged">Flagged</option>
                    <option value="hidden">Hidden</option>
                  </select>

                  <select
                    value={reviewTargetFilter}
                    onChange={(e) => setReviewTargetFilter(e.target.value)}
                    className="p-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs"
                  >
                    <option value="all">All Targets</option>
                    <option value="game">Games Only</option>
                    <option value="product">Products Only</option>
                  </select>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {filteredReviews.length === 0 ? (
                  <div className="p-8 text-center text-white/40 bg-black/30 rounded-2xl">
                    No reviews match current filters.
                  </div>
                ) : (
                  filteredReviews.map((r) => (
                    <div
                      key={r.id}
                      className={`p-4 rounded-2xl border space-y-2 transition-all ${
                        r.status === "hidden"
                          ? "bg-red-950/20 border-red-500/30"
                          : r.status === "flagged"
                          ? "bg-amber-950/20 border-amber-500/30"
                          : "bg-black/40 border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{r.userName}</span>
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white/60 text-[10px]">
                            {r.targetType.toUpperCase()}: {r.targetTitle}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              r.status === "approved"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : r.status === "hidden"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {r.status || "approved"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-orange-400">
                          <Star className="w-3.5 h-3.5 fill-orange-400" />
                          <span className="font-bold">{r.rating}.0</span>
                        </div>
                      </div>

                      {r.title && <div className="text-white font-bold">{r.title}</div>}
                      <p className="text-white/80 font-sans">{r.comment}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-[10px] text-white/40">
                          Helpful Votes: {r.helpfulVotes || 0} • {r.createdAt?.split("T")[0] || r.createdAt}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateReviewStatus(r.id, "approved")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateReviewStatus(r.id, "flagged")}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold"
                          >
                            Flag
                          </button>
                          <button
                            onClick={() =>
                              updateReviewStatus(r.id, r.status === "hidden" ? "approved" : "hidden")
                            }
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-[10px]"
                          >
                            {r.status === "hidden" ? "Unhide" : "Hide"}
                          </button>
                          <button
                            onClick={() => deleteReview(r.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 3. RBAC ROLE PERMISSION MATRIX */}
          {activeTab === "rbac" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6 animate-in fade-in font-mono text-xs backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                    Role-Based Access Control (RBAC) Matrix
                  </h3>
                  <p className="text-white/50 text-[11px] mt-0.5">
                    Granular permission allocation across Customer, Creator, Admin, and Super Admin tiers.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => resetRolePermissions()}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 text-[11px]"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>

              {/* Role Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {(["CUSTOMER", "CREATOR", "ADMIN", "SUPER_ADMIN", "OWNER"] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRbacRole(role)}
                    className={`px-4 py-2 rounded-2xl font-bold uppercase whitespace-nowrap transition-all ${
                      selectedRbacRole === role
                        ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                        : "bg-black/40 text-white/60 hover:text-white border border-white/10"
                    }`}
                  >
                    {role}
                    {currentRole === role && <span className="ml-1.5 text-[10px] text-emerald-900 bg-emerald-400 px-1.5 py-0.5 rounded font-black">ACTIVE</span>}
                  </button>
                ))}
              </div>

              {/* Permissions Checklist for selected Role */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-white/50 uppercase text-[11px] px-1">
                  <span>Permission Node</span>
                  <span>Access Grant</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ALL_AVAILABLE_PERMISSIONS.map((perm) => {
                    const isGranted = (rolePermissions[selectedRbacRole] || []).includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => updateRolePermission(selectedRbacRole, perm.id, !isGranted)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isGranted
                            ? "bg-orange-500/10 border-orange-500/30 text-white"
                            : "bg-black/30 border-white/5 text-white/40 hover:border-white/20"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{perm.label}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 uppercase">
                              {perm.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-white/50 leading-relaxed font-sans">
                            {perm.description}
                          </p>
                        </div>

                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                            isGranted
                              ? "bg-orange-500 text-black border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                              : "border-white/20 bg-black/50 text-transparent"
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Role Quick Switcher */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 mt-4">
                <span className="text-white/60 font-bold uppercase block text-[11px]">
                  Simulate & Test Roles Live:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(["CUSTOMER", "CREATOR", "ADMIN", "SUPER_ADMIN", "OWNER"] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setCurrentRole(r)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold ${
                        currentRole === r
                          ? "bg-orange-500 text-black border-orange-400"
                          : "bg-white/5 text-white/70 hover:text-white border-white/10"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. APPEARANCE & THEME */}
          {activeTab === "appearance" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6 animate-in fade-in font-mono text-xs backdrop-blur-md">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Theme Presets & Video Canvas
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {themePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setDraftConfig({
                        ...draftConfig,
                        themeColor: preset.primary,
                        accentColor: preset.accent,
                      });
                    }}
                    className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-orange-500/40 text-left transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{preset.label}</span>
                      <div className="flex gap-1.5">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <label className="text-white/60 block">Background Video URL (MP4 / WebM)</label>
                <input
                  type="text"
                  value={draftConfig.videoBackgroundUrl}
                  onChange={(e) => setDraftConfig({ ...draftConfig, videoBackgroundUrl: e.target.value })}
                  placeholder="https://assets.mixkit.co/videos/..."
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {/* 5. HERO BUILDER */}
          {activeTab === "hero" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4 animate-in fade-in font-mono text-xs backdrop-blur-md">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Hero Section Headline & Branding
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-white/60 block mb-1">Hero Title</label>
                  <input
                    type="text"
                    value={draftConfig.heroTitle}
                    onChange={(e) => setDraftConfig({ ...draftConfig, heroTitle: e.target.value })}
                    className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Hero Subtitle</label>
                  <input
                    type="text"
                    value={draftConfig.heroSubtitle}
                    onChange={(e) => setDraftConfig({ ...draftConfig, heroSubtitle: e.target.value })}
                    className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. GAMES MANAGER */}
          {activeTab === "games" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4 animate-in fade-in font-mono text-xs backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Hosted Games Repository</h3>
                <span className="text-orange-400 font-bold">{games.length} Games Hosted</span>
              </div>
              <div className="space-y-3">
                {games.map((g) => (
                  <div
                    key={g.id}
                    className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img src={g.coverImage} alt="" referrerPolicy="no-referrer" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-white">{g.title}</h4>
                        <span className="text-white/40">{g.category} • v{g.version} • {g.fileSize}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteGame(g.id)}
                      className="p-2 text-white/40 hover:text-red-400 transition-colors"
                      title="Delete Game"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. PRODUCTS MANAGER */}
          {activeTab === "products" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4 animate-in fade-in font-mono text-xs backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Digital Store Assets</h3>
                <span className="text-orange-400 font-bold">{products.length} Products</span>
              </div>
              <div className="space-y-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.thumbnail} alt="" referrerPolicy="no-referrer" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-white">{p.title}</h4>
                        <span className="text-white/40">{p.category} • {p.fileSize} • ${p.price}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-2 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. PORTFOLIO */}
          {activeTab === "portfolio" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4 animate-in fade-in font-mono text-xs backdrop-blur-md">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Portfolio Showcase Projects</h3>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-bold text-white">{proj.title}</h4>
                      <span className="text-white/40">{proj.category}</span>
                    </div>
                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="p-2 text-white/40 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. ORDERS VAULT */}
          {activeTab === "orders" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4 animate-in fade-in font-mono text-xs backdrop-blur-md">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Platform Orders & Transactions</h3>
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                    <div className="flex justify-between font-bold">
                      <span className="text-orange-400">{o.id}</span>
                      <span className="text-emerald-400">${o.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="text-white/60">
                      Customer: {o.customerName} ({o.customerEmail}) • Gateway: {o.paymentMethod}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. DISCORD WEBHOOK */}
          {activeTab === "discord" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6 animate-in fade-in font-mono text-xs backdrop-blur-md">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Discord Webhook & Live Notifications
              </h3>

              <div>
                <label className="text-white/60 block mb-1">Discord Webhook URL</label>
                <input
                  type="text"
                  value={draftConfig.discordWebhookUrl}
                  onChange={(e) => setDraftConfig({ ...draftConfig, discordWebhookUrl: e.target.value })}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                onClick={handleTriggerDiscordTest}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Trigger Test Notification Embed
              </button>

              {discordTestStatus && (
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-orange-300">
                  {discordTestStatus}
                </div>
              )}
            </div>
          )}

          {/* 11. BACKUP & RESTORE */}
          {activeTab === "backup" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6 animate-in fade-in font-mono text-xs backdrop-blur-md">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                System Backup, Restore & Maintenance
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <h4 className="font-bold text-white">Export Database Snapshot</h4>
                  <p className="text-white/60 text-[11px]">
                    Download a full JSON image containing all games, products, orders, reviews, RBAC permissions, and site customization.
                  </p>
                  <button
                    onClick={handleExportBackup}
                    className="px-4 py-2.5 rounded-xl bg-orange-500 text-black font-black flex items-center gap-2 shadow-md hover:bg-orange-400 transition-all"
                  >
                    <Download className="w-4 h-4" /> Export Backup (.json)
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <h4 className="font-bold text-white">Reset Site to Factory Default</h4>
                  <p className="text-white/60 text-[11px]">
                    Restores initial theme, video loop, default permissions, and sample catalog items.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm("Reset website appearance and settings to default?")) {
                        resetSiteConfig();
                        resetRolePermissions();
                        setDraftConfig(siteConfig);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 font-bold flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Reset Factory Defaults
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
