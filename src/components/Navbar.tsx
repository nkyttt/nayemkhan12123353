import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";
import {
  Gamepad2,
  Sparkles,
  Search,
  ShoppingCart,
  Shield,
  User,
  LogOut,
  LogIn,
  Bell,
  Code,
  Store,
  Layers,
  Menu,
  X,
  Palette,
  ExternalLink,
  ChevronDown,
  Heart,
} from "lucide-react";

interface NavbarProps {
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications }) => {
  const {
    siteConfig,
    activeView,
    setActiveView,
    cart,
    setIsCartOpen,
    setIsAiModalOpen,
    setIsSearchModalOpen,
    currentUser,
    currentRole,
    setCurrentRole,
    hasPermission,
    wishlist,
    loginWithGoogle,
    logout,
    notifications,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const roles: { role: UserRole; label: string; badgeColor: string }[] = [
    { role: "OWNER", label: "Owner (Super Admin)", badgeColor: "bg-red-500/20 text-red-400 border-red-500/40" },
    { role: "ADMIN", label: "Admin Panel", badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/40" },
    { role: "CREATOR", label: "Creator / Seller", badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
    { role: "CUSTOMER", label: "Customer / Gamer", badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" },
  ];

  return (
    <header
      id="main-navigation-bar"
      className="sticky top-0 z-40 w-full backdrop-blur-md bg-black/40 border-b border-white/10 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand / Logo */}
        <div
          id="brand-logo-container"
          onClick={() => {
            setActiveView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tighter uppercase text-white font-mono block leading-none">
              {siteConfig.siteName}
            </span>
            <span className="hidden sm:block text-[9px] uppercase font-mono tracking-widest text-orange-500 font-bold mt-1">
              Encrypted Game Infrastructure
            </span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav id="desktop-nav-links" className="hidden lg:flex items-center gap-6 text-xs uppercase font-bold tracking-wider text-white/70">
          <button
            id="nav-link-home"
            onClick={() => setActiveView("home")}
            className={`transition-colors py-1.5 ${
              activeView === "home"
                ? "text-orange-500 font-black"
                : "hover:text-white"
            }`}
          >
            HOME
          </button>
          <button
            id="nav-link-games"
            onClick={() => setActiveView("games")}
            className={`transition-colors py-1.5 ${
              activeView === "games" || activeView === "game-detail"
                ? "text-orange-500 font-black"
                : "hover:text-white"
            }`}
          >
            GAMES
          </button>
          <button
            id="nav-link-store"
            onClick={() => setActiveView("store")}
            className={`transition-colors py-1.5 ${
              activeView === "store" || activeView === "product-detail"
                ? "text-orange-500 font-black"
                : "hover:text-white"
            }`}
          >
            STORE
          </button>
          <button
            id="nav-link-portfolio"
            onClick={() => setActiveView("portfolio")}
            className={`transition-colors py-1.5 ${
              activeView === "portfolio"
                ? "text-orange-500 font-black"
                : "hover:text-white"
            }`}
          >
            PORTFOLIO
          </button>
          <button
            id="nav-link-admin-shortcut"
            onClick={() => setActiveView("admin")}
            className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1 rounded border border-white/10 uppercase text-white/80 hover:text-white transition-all font-mono"
          >
            Admin Panel
          </button>
        </nav>

        {/* Right Action Icons & Controls */}
        <div id="nav-actions-group" className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Button */}
          <button
            id="nav-global-search-btn"
            onClick={() => setIsSearchModalOpen(true)}
            className="p-2.5 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2 group"
            title="Search Games, Store, & Portfolio (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
            <span className="hidden xl:inline text-xs text-white/60 font-mono pr-1">Search</span>
            <kbd className="hidden xl:inline text-[10px] bg-black/60 text-white/40 px-1.5 py-0.5 rounded border border-white/10">⌘K</kbd>
          </button>

          {/* AI Master Assistant Button */}
          <button
            id="nav-ai-assistant-btn"
            onClick={() => setIsAiModalOpen(true)}
            className="relative px-3 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all flex items-center gap-2 group text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            <span className="hidden sm:inline uppercase tracking-wider text-[11px]">AI Assistant</span>
          </button>

          {/* Notifications Trigger */}
          <button
            id="nav-notifications-btn"
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-black text-[10px] font-black flex items-center justify-center animate-pulse">
                {unreadNotifs}
              </span>
            )}
          </button>

          {/* Wishlist Trigger */}
          <button
            id="nav-wishlist-btn"
            onClick={() => setActiveView("user-dashboard")}
            className="relative p-2.5 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
            title="Your Wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlist.length > 0 ? "text-red-400 fill-red-400/30" : ""}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-md">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            id="nav-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-black text-xs font-black flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.8)]">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Role & Auth Dropdown */}
          <div className="relative">
            <button
              id="nav-role-switcher-btn"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/40 transition-all"
            >
              <div className="w-8 h-8 rounded-full border-2 border-orange-500 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {currentUser?.displayName ? currentUser.displayName.charAt(0) : "A"}
                </div>
              </div>
              <div className="hidden md:flex flex-col text-left pr-2">
                <span className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-[90px]">
                  {currentUser?.displayName || "Alpha Dev"}
                </span>
                <span className="text-[9px] text-orange-500 font-mono uppercase tracking-widest font-bold">
                  {currentRole === "OWNER" ? "Super Admin" : currentRole}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/40 pr-1" />
            </button>

            {/* Dropdown Menu */}
            {isRoleDropdownOpen && (
              <div
                id="role-dropdown-menu"
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0a0a0c]/95 border border-white/10 backdrop-blur-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
              >
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="text-[10px] uppercase font-bold text-white/40 font-mono">Authenticated User</p>
                  <p className="text-xs font-bold text-orange-400 truncate mt-0.5">
                    {currentUser?.email || "nkoffcil27@gmail.com"}
                  </p>
                </div>

                {/* Dashboard & Portal Links */}
                <div className="py-2 space-y-1 border-b border-white/10 text-xs">
                  <button
                    onClick={() => {
                      setActiveView("user-dashboard");
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-lg flex items-center gap-2 text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <User className="w-4 h-4 text-orange-400" />
                    User Dashboard & Downloads
                  </button>
                  <button
                    onClick={() => {
                      setActiveView("creator-dashboard");
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-lg flex items-center gap-2 text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <Layers className="w-4 h-4 text-orange-400" />
                    Creator / Seller Portal
                  </button>
                  <button
                    onClick={() => {
                      setActiveView("admin");
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-lg flex items-center gap-2 text-white bg-gradient-to-r from-orange-600/30 to-red-600/30 border border-orange-500/30 font-bold"
                  >
                    <Shield className="w-4 h-4 text-orange-400" />
                    Admin Panel & Site Config
                  </button>
                </div>

                {/* RBAC Role Switcher */}
                <div className="py-2 border-b border-white/10">
                  <p className="text-[9px] uppercase tracking-wider text-white/40 px-3 pb-1 font-mono font-bold">
                    Test RBAC Roles
                  </p>
                  <div className="space-y-1">
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => {
                          setCurrentRole(r.role);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                          currentRole === r.role ? "bg-orange-500/20 text-orange-400 font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span>{r.label}</span>
                        {currentRole === r.role && <span className="w-2 h-2 rounded-full bg-orange-500"></span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Login / Logout Button */}
                <div className="pt-2">
                  {currentUser ? (
                    <button
                      onClick={() => {
                        logout();
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/40 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        loginWithGoogle();
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-lg text-xs font-bold text-black bg-white hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 text-white/70 border border-white/10"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div id="mobile-nav-drawer" className="lg:hidden bg-[#0a0a0c] border-b border-white/10 px-4 py-4 space-y-2">
          <button
            onClick={() => {
              setActiveView("home");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
              activeView === "home" ? "bg-orange-500/20 text-orange-400" : "text-white/70"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              setActiveView("games");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
              activeView === "games" ? "bg-orange-500/20 text-orange-400" : "text-white/70"
            }`}
          >
            Games
          </button>
          <button
            onClick={() => {
              setActiveView("store");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
              activeView === "store" ? "bg-orange-500/20 text-orange-400" : "text-white/70"
            }`}
          >
            Creator Store
          </button>
          <button
            onClick={() => {
              setActiveView("portfolio");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
              activeView === "portfolio" ? "bg-orange-500/20 text-orange-400" : "text-white/70"
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => {
              setActiveView("admin");
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-orange-400 bg-white/5 border border-white/10"
          >
            Admin Panel
          </button>
        </div>
      )}
    </header>
  );
};
