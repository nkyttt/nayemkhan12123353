export type UserRole = "OWNER" | "SUPER_ADMIN" | "ADMIN" | "CREATOR" | "CUSTOMER";

export type Permission =
  | "view_catalog"
  | "download_free"
  | "purchase_items"
  | "manage_wishlist"
  | "submit_reviews"
  | "view_orders"
  | "upload_games"
  | "manage_games"
  | "upload_products"
  | "manage_products"
  | "view_creator_analytics"
  | "access_creator_portal"
  | "moderate_reviews"
  | "view_all_orders"
  | "manage_site_settings"
  | "manage_rbac"
  | "export_backups"
  | "access_admin_panel";

export interface RoleDefinition {
  role: UserRole;
  name: string;
  description: string;
  badgeColor: string;
  permissions: Permission[];
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    "view_catalog",
    "download_free",
    "purchase_items",
    "manage_wishlist",
    "submit_reviews",
    "view_orders",
    "upload_games",
    "manage_games",
    "upload_products",
    "manage_products",
    "view_creator_analytics",
    "access_creator_portal",
    "moderate_reviews",
    "view_all_orders",
    "manage_site_settings",
    "manage_rbac",
    "export_backups",
    "access_admin_panel",
  ],
  SUPER_ADMIN: [
    "view_catalog",
    "download_free",
    "purchase_items",
    "manage_wishlist",
    "submit_reviews",
    "view_orders",
    "upload_games",
    "manage_games",
    "upload_products",
    "manage_products",
    "view_creator_analytics",
    "access_creator_portal",
    "moderate_reviews",
    "view_all_orders",
    "manage_site_settings",
    "manage_rbac",
    "export_backups",
    "access_admin_panel",
  ],
  ADMIN: [
    "view_catalog",
    "download_free",
    "purchase_items",
    "manage_wishlist",
    "submit_reviews",
    "view_orders",
    "upload_games",
    "manage_games",
    "upload_products",
    "manage_products",
    "view_creator_analytics",
    "access_creator_portal",
    "moderate_reviews",
    "view_all_orders",
    "manage_site_settings",
    "manage_rbac",
    "export_backups",
    "access_admin_panel",
  ],
  CREATOR: [
    "view_catalog",
    "download_free",
    "purchase_items",
    "manage_wishlist",
    "submit_reviews",
    "view_orders",
    "upload_games",
    "manage_games",
    "upload_products",
    "manage_products",
    "view_creator_analytics",
    "access_creator_portal",
  ],
  CUSTOMER: [
    "view_catalog",
    "download_free",
    "purchase_items",
    "manage_wishlist",
    "submit_reviews",
    "view_orders",
  ],
};

export const PERMISSION_DESCRIPTIONS: Record<Permission, { label: string; category: string; description: string }> = {
  view_catalog: { label: "Browse Catalog", category: "Catalog & Browsing", description: "View all public games, assets, and portfolios." },
  download_free: { label: "Free Downloads", category: "Catalog & Browsing", description: "Download free game builds and open asset packages." },
  purchase_items: { label: "Purchase & Checkout", category: "Store & Commerce", description: "Buy paid games and creator digital assets." },
  manage_wishlist: { label: "Manage Wishlist", category: "User Features", description: "Add/remove items to personal wishlist and move to cart." },
  submit_reviews: { label: "Submit Ratings & Reviews", category: "User Features", description: "Write reviews and star ratings on games and products." },
  view_orders: { label: "View Own Orders", category: "User Features", description: "Access personal purchase history and license keys." },
  upload_games: { label: "Upload & Host Games", category: "Creator Portal", description: "Publish new games, binaries, and version changelogs." },
  manage_games: { label: "Manage Game Builds", category: "Creator Portal", description: "Edit existing game metadata, prices, and specifications." },
  upload_products: { label: "Upload Store Assets", category: "Creator Portal", description: "List digital products, shaders, 3D models, and source code." },
  manage_products: { label: "Manage Store Assets", category: "Creator Portal", description: "Edit product pricing, license tiers, and files." },
  view_creator_analytics: { label: "Creator Analytics", category: "Creator Portal", description: "View sales earnings, download counts, and conversion metrics." },
  access_creator_portal: { label: "Access Creator Portal", category: "Creator Portal", description: "Enter and navigate the creator seller portal." },
  moderate_reviews: { label: "Moderate & Remove Reviews", category: "Platform Moderation", description: "Moderate, hide, flag, or delete user reviews." },
  view_all_orders: { label: "View Global Orders", category: "Platform Admin", description: "Inspect all customer orders, transactions, and revenues." },
  manage_site_settings: { label: "Manage Site & Appearance", category: "Platform Admin", description: "Modify global themes, video backgrounds, hero text, and SEO." },
  manage_rbac: { label: "Manage RBAC Matrix", category: "Platform Admin", description: "Configure roles, assign granular permissions, and test access." },
  export_backups: { label: "Export Backups", category: "Platform Admin", description: "Download full JSON snapshots of the platform database." },
  access_admin_panel: { label: "Access Master Admin Panel", category: "Platform Admin", description: "Enter and navigate the administrative control center." },
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconKey: string;
  description: string;
  status: "active" | "inactive";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDoc {
  uid: string;
  email: string;
  role: "OWNER" | "ADMIN" | "EDITOR" | "MODERATOR";
  active: boolean;
  displayName?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuditLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  resourceType: "product" | "category" | "game" | "portfolio" | "media" | "auth" | "settings" | "order" | "rbac";
  resourceId?: string;
  resourceTitle?: string;
  details?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  categoryId?: string;
  version: string;
  developer: string;
  publisher: string;
  releaseDate: string;
  coverImage: string;
  bannerImage: string;
  screenshots: string[];
  trailerUrl?: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  price: number;
  currency?: string;
  discountPrice?: number;
  isFree: boolean;
  isFeatured: boolean;
  rating: number;
  reviewsCount: number;
  downloadsCount: number;
  tags: string[];
  minCpu: string;
  minGpu: string;
  minRam: string;
  minStorage: string;
  minOs: string;
  recCpu?: string;
  recGpu?: string;
  recRam?: string;
  status: "published" | "draft" | "updating";
  changelog?: { version: string; date: string; notes: string[] }[];
}

export interface DigitalProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: string;
  categoryId?: string;
  price: number;
  currency?: string;
  discountPrice?: number;
  isFree: boolean;
  thumbnail: string;
  imageUrl?: string;
  buyNowUrl?: string;
  gallery: string[];
  version: string;
  licenseType: "Personal" | "Commercial" | "Extended" | "Lifetime";
  tags: string[];
  demoUrl?: string;
  docsUrl?: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  salesCount: number;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  status?: "published" | "draft" | "deleted";
  developer?: string;
  releaseDate?: string;
  creatorId: string;
  creatorName: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  gallery?: string[];
  videoUrl?: string;
  category: "Game Development" | "3D Art & Shaders" | "Engine Tools" | "Full-Stack Web" | "Mobile Game";
  technologies: string[];
  liveDemoUrl?: string;
  sourceCodeUrl?: string;
  client?: string;
  date: string;
  isFeatured: boolean;
}

export interface PortfolioSkill {
  id: string;
  name: string;
  category: "Engines & Tools" | "Programming" | "Art & Design" | "Web & Cloud";
  percentage: number;
  icon?: string;
}

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  type: "game" | "product";
  fileName: string;
  fileSize: string;
  licenseType?: string;
  thumbnail?: string;
}

export interface Order {
  id: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  totalAmount: number;
  discountApplied?: number;
  couponCode?: string;
  paymentMethod: "bKash" | "Nagad" | "Rocket" | "Credit Card" | "Crypto" | "Free Checkout";
  paymentStatus: "completed" | "pending" | "failed" | "refunded";
  transactionId: string;
  items: OrderItem[];
  createdAt: string;
  licenseKeys: Record<string, string>;
  downloadTokens: Record<string, string>;
}

export interface Review {
  id: string;
  targetType: "game" | "product";
  targetId: string;
  targetTitle?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  title?: string; // Review headline
  comment: string;
  createdAt: string;
  isVerifiedPurchase?: boolean;
  helpfulVotes?: number;
  status: "approved" | "pending" | "flagged" | "hidden";
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  type: "game" | "product";
  fileName: string;
  fileSize: string;
  licenseType?: "Personal" | "Commercial" | "Extended" | "Lifetime";
  quantity: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  wishlist: string[];
  purchasedItemIds: string[];
  downloadsHistory: Array<{
    itemId: string;
    itemTitle: string;
    fileName: string;
    downloadDate: string;
    fileSize: string;
  }>;
}

export interface SiteConfig {
  id?: string;
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  themePreset: "immersive" | "cyber" | "gaming" | "neon" | "minimal" | "dark" | "light";
  primaryColor: string;
  accentColor: string;
  surfaceColor?: string;
  fontFamily: "sans" | "mono" | "display" | "cyber";
  borderRadius: "none" | "sm" | "md" | "lg" | "full";
  
  // Video Background Configuration
  showVideoBg: boolean;
  videoBgUrl: string;
  videoBgType: "mp4" | "webm" | "youtube" | "gradient" | "matrixGrid";
  videoOverlayOpacity: number;
  videoBlur: number;
  videoSpeed: number;
  fallbackImageUrl: string;
  
  // Hero Configuration
  heroHeading: string;
  heroSubtitle: string;
  heroBtnPrimaryText: string;
  heroBtnPrimaryUrl: string;
  heroBtnSecondaryText: string;
  heroBtnSecondaryUrl: string;
  heroAlignment: "center" | "left" | "right";
  
  // Navigation & Sections
  sections: {
    hero: boolean;
    featuredGames: boolean;
    portfolioHighlight: boolean;
    storeHighlight: boolean;
    skillsAndAbout: boolean;
    testimonials: boolean;
    faq: boolean;
    contact: boolean;
  };
  
  footerColumns: {
    about: boolean;
    quickLinks: boolean;
    games: boolean;
    store: boolean;
    portfolio: boolean;
    social: boolean;
    newsletter: boolean;
  };

  socialLinks: {
    discord?: string;
    youtube?: string;
    github?: string;
    twitter?: string;
    steam?: string;
    twitch?: string;
  };

  // Platform & Security Controls
  maintenanceMode: boolean;
  maintenanceMessage: string;
  discordWebhookUrl: string;
  customDomain: string;
  customCss: string;
  customJs: string;
  // SEO, OpenGraph & Sitemap Configuration
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalUrl?: string;
  authorName?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  ogType?: "website" | "article" | "game" | "product";
  twitterCard?: "summary" | "summary_large_image";
  twitterCreator?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  enableJsonLd?: boolean;
  sitemapConfig?: {
    includeGames: boolean;
    includeProducts: boolean;
    includePortfolio: boolean;
    changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly";
    priority: number;
    lastmod?: string;
  };
  supportedExtensions: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "order" | "download" | "system" | "discord" | "email";
  timestamp: string;
  read: boolean;
}
