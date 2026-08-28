import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  Game,
  DigitalProduct,
  PortfolioProject,
  PortfolioSkill,
  SiteConfig,
  Order,
  Review,
  CartItem,
  UserProfile,
  UserRole,
  NotificationItem,
  Permission,
  DEFAULT_ROLE_PERMISSIONS,
  Category,
  AdminUserDoc,
  AuditLog,
} from "../types";
import {
  initialSiteConfig,
  initialGames,
  initialProducts,
  initialPortfolioProjects,
  initialSkills,
  initialReviews,
  initialCategories,
} from "../data/initialData";
import {
  auth,
  db,
  initAuth,
  googleSignIn,
  logoutUser,
  getCachedAccessToken,
  loginAdminWithEmail,
  resetAdminPassword,
  checkAdminAuthorization,
  logAdminAction,
  OperationType,
  handleFirestoreError,
} from "../lib/firebase";
import { User } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

interface AppContextType {
  // Config & Appearance
  siteConfig: SiteConfig;
  updateSiteConfig: (newConfig: Partial<SiteConfig>) => Promise<void>;
  resetSiteConfig: () => void;

  // Categories State
  categories: Category[];
  addCategory: (cat: Omit<Category, "id" | "createdAt" | "updatedAt">) => Promise<string>;
  updateCategory: (id: string, cat: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string, moveItemsToCategoryId?: string) => Promise<boolean>;
  getCategoryItemCounts: (categoryId: string) => { productsCount: number; gamesCount: number; total: number };

  // Games State
  games: Game[];
  addGame: (game: Omit<Game, "id">) => Promise<string>;
  updateGame: (id: string, game: Partial<Game>) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;

  // Products State
  products: DigitalProduct[];
  addProduct: (product: Omit<DigitalProduct, "id">) => Promise<string>;
  updateProduct: (id: string, product: Partial<DigitalProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  bulkUpdateProducts: (ids: string[], updates: Partial<DigitalProduct>) => Promise<void>;
  bulkDeleteProducts: (ids: string[]) => Promise<void>;
  bulkPublishProducts: (ids: string[], publish: boolean) => Promise<void>;

  // Portfolio State
  projects: PortfolioProject[];
  addProject: (project: Omit<PortfolioProject, "id">) => Promise<string>;
  updateProject: (id: string, project: Partial<PortfolioProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  skills: PortfolioSkill[];
  updateSkill: (id: string, skill: Partial<PortfolioSkill>) => void;
  addSkill: (skill: Omit<PortfolioSkill, "id">) => void;
  deleteSkill: (id: string) => void;

  // Shopping Cart & Orders
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  orders: Order[];
  createOrder: (orderData: Omit<Order, "id" | "createdAt" | "downloadTokens" | "licenseKeys">) => Promise<Order>;

  // Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, "id" | "createdAt">) => Promise<void>;
  updateReviewStatus: (id: string, status: "approved" | "pending" | "flagged" | "hidden") => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  voteHelpful: (id: string) => void;

  // Auth & RBAC
  currentUser: User | null;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  rolePermissions: Record<UserRole, Permission[]>;
  updateRolePermission: (role: UserRole, permission: Permission, allowed: boolean) => void;
  resetRolePermissions: () => void;
  hasPermission: (permission: Permission) => boolean;
  can: (permission: Permission) => boolean;
  userProfile: UserProfile | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  accessToken: string | null;

  // Admin Specific Authentication & Authorization
  adminUser: AdminUserDoc | null;
  isAdminAuthorized: boolean;
  adminAuthLoading: boolean;
  adminAuthError: string | null;
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  adminRoute: string;
  setAdminRoute: (route: string, targetId?: string) => void;
  adminTargetId: string | null;

  // Audit Logs
  auditLogs: AuditLog[];
  logAdminEvent: (
    action: string,
    resourceType: AuditLog["resourceType"],
    resourceId?: string,
    resourceTitle?: string,
    details?: string,
    metadata?: Record<string, any>
  ) => Promise<void>;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (id: string, itemTitle?: string) => void;
  isInWishlist: (id: string) => boolean;
  moveWishlistItemToCart: (id: string) => void;
  clearWishlist: () => void;

  // Notifications
  notifications: NotificationItem[];
  addNotification: (notif: Omit<NotificationItem, "id" | "timestamp" | "read">) => void;
  markNotificationAsRead: (id: string) => void;
  removeNotification: (id: string) => void;

  // Secure Expiring Download Generator
  generateSecureDownload: (item: {
    id: string;
    title: string;
    fileName: string;
    fileSize: string;
    fileUrl: string;
    type: "game" | "product";
  }) => Promise<{ token: string; downloadUrl: string; expiresInMinutes: number }>;

  // Modals & Navigation Helpers
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  activeView: "home" | "games" | "store" | "portfolio" | "dashboard" | "creator" | "admin" | "game-detail" | "product-detail";
  setActiveView: (view: any) => void;
  selectedGameId: string | null;
  setSelectedGameId: (id: string | null) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Core State
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem("gamehub_site_config");
    return saved ? { ...initialSiteConfig, ...JSON.parse(saved) } : initialSiteConfig;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem("gamehub_categories");
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem("gamehub_games");
    return saved ? JSON.parse(saved) : initialGames;
  });

  const [products, setProducts] = useState<DigitalProduct[]>(() => {
    const saved = localStorage.getItem("gamehub_products");
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [projects, setProjects] = useState<PortfolioProject[]>(() => {
    const saved = localStorage.getItem("gamehub_projects");
    return saved ? JSON.parse(saved) : initialPortfolioProjects;
  });

  const [skills, setSkills] = useState<PortfolioSkill[]>(() => {
    const saved = localStorage.getItem("gamehub_skills");
    return saved ? JSON.parse(saved) : initialSkills;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("gamehub_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("gamehub_orders");
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem("gamehub_reviews");
    return saved ? JSON.parse(saved) : initialReviews;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem("gamehub_audit_logs");
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem("gamehub_wishlist");
    return saved ? JSON.parse(saved) : ["game-1", "prod-2"];
  });

  // 2. User & RBAC State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem("gamehub_current_role");
    return (saved as UserRole) || "ADMIN";
  });
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, Permission[]>>(() => {
    const saved = localStorage.getItem("gamehub_role_permissions");
    return saved ? JSON.parse(saved) : DEFAULT_ROLE_PERMISSIONS;
  });
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // 3. Admin Authentication & Authorization State
  const [adminUser, setAdminUser] = useState<AdminUserDoc | null>(null);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(false);
  const [adminAuthLoading, setAdminAuthLoading] = useState<boolean>(true);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [adminRoute, setAdminRouteState] = useState<string>("dashboard");
  const [adminTargetId, setAdminTargetId] = useState<string | null>(null);

  const setAdminRoute = useCallback((route: string, targetId?: string) => {
    setAdminRouteState(route);
    setAdminTargetId(targetId || null);
  }, []);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      title: "GameHub CXT Ready",
      message: "Admin & Creator control system loaded.",
      type: "system",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    },
  ]);

  // 4. Modals & Navigation state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeView, setActiveView] = useState<"home" | "games" | "store" | "portfolio" | "dashboard" | "creator" | "admin" | "game-detail" | "product-detail">("home");
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Sync to local storage for offline resiliency
  useEffect(() => {
    localStorage.setItem("gamehub_site_config", JSON.stringify(siteConfig));
  }, [siteConfig]);

  useEffect(() => {
    localStorage.setItem("gamehub_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("gamehub_games", JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem("gamehub_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("gamehub_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("gamehub_skills", JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem("gamehub_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("gamehub_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("gamehub_reviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem("gamehub_audit_logs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem("gamehub_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("gamehub_current_role", currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem("gamehub_role_permissions", JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  // 5. Auth State Observer & Authorization Check
  useEffect(() => {
    setAdminAuthLoading(true);
    const unsubscribe = initAuth(
      async (user, token) => {
        setCurrentUser(user);
        if (token) setAccessToken(token);

        // Verify Admin Authorization against Firestore `admins/{uid}`
        try {
          const authCheck = await checkAdminAuthorization(user);
          if (authCheck.isAuthorized && authCheck.adminDoc) {
            setAdminUser(authCheck.adminDoc);
            setIsAdminAuthorized(true);
            setAdminAuthError(null);
            setCurrentRole(authCheck.adminDoc.role as UserRole);
          } else {
            setAdminUser(null);
            setIsAdminAuthorized(false);
          }
        } catch (err: any) {
          console.error("Admin verification error:", err);
          setIsAdminAuthorized(false);
        } finally {
          setAdminAuthLoading(false);
        }

        setUserProfile({
          uid: user.uid,
          email: user.email || "user@gamehubcxt.io",
          displayName: user.displayName || "Gamer",
          photoURL: user.photoURL || undefined,
          role: currentRole,
          wishlist: wishlist,
          purchasedItemIds: orders.flatMap((o) => o.items.map((i) => i.id)),
          downloadsHistory: [],
        });
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setAdminUser(null);
        setIsAdminAuthorized(false);
        setAdminAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, [currentRole, orders, wishlist]);

  // 6. Firestore Initial Data Hydration
  useEffect(() => {
    async function loadFirestoreData() {
      try {
        // Site Config
        const configDoc = await getDoc(doc(db, "siteConfig", "main"));
        if (configDoc.exists()) {
          setSiteConfig((prev) => ({ ...prev, ...(configDoc.data() as Partial<SiteConfig>) }));
        }

        // Categories
        const catSnap = await getDocs(collection(db, "categories"));
        if (!catSnap.empty) {
          const loadedCats: Category[] = [];
          catSnap.forEach((d) => loadedCats.push({ ...(d.data() as Category), id: d.id }));
          loadedCats.sort((a, b) => a.sortOrder - b.sortOrder);
          setCategories(loadedCats);
        }

        // Games
        const gamesSnap = await getDocs(collection(db, "games"));
        if (!gamesSnap.empty) {
          const loadedGames: Game[] = [];
          gamesSnap.forEach((d) => loadedGames.push({ ...(d.data() as Game), id: d.id }));
          setGames(loadedGames);
        }

        // Products
        const prodSnap = await getDocs(collection(db, "products"));
        if (!prodSnap.empty) {
          const loadedProducts: DigitalProduct[] = [];
          prodSnap.forEach((d) => loadedProducts.push({ ...(d.data() as DigitalProduct), id: d.id }));
          setProducts(loadedProducts);
        }

        // Audit Logs (recent 50)
        try {
          const auditSnap = await getDocs(query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(50)));
          if (!auditSnap.empty) {
            const loadedLogs: AuditLog[] = [];
            auditSnap.forEach((d) => loadedLogs.push({ ...(d.data() as AuditLog), id: d.id }));
            setAuditLogs(loadedLogs);
          }
        } catch (e) {
          // non-blocking
        }
      } catch (err) {
        // fallback to memory
      }
    }
    loadFirestoreData();
  }, []);

  // 7. Audit Event Logger
  const logAdminEvent = useCallback(
    async (
      action: string,
      resourceType: AuditLog["resourceType"],
      resourceId?: string,
      resourceTitle?: string,
      details?: string,
      metadata?: Record<string, any>
    ) => {
      const email = adminUser?.email || currentUser?.email || "admin@gamehubcxt.io";
      const uid = adminUser?.uid || currentUser?.uid || "system";
      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newLog: AuditLog = {
        id: logId,
        adminUid: uid,
        adminEmail: email,
        action,
        resourceType,
        resourceId,
        resourceTitle,
        details,
        timestamp: new Date().toISOString(),
        metadata,
      };

      setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
      await logAdminAction(newLog);
    },
    [adminUser, currentUser]
  );

  // 8. Admin Login with Email / Password
  const loginAdmin = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setAdminAuthLoading(true);
    setAdminAuthError(null);
    try {
      const user = await loginAdminWithEmail(email, pass);
      const authCheck = await checkAdminAuthorization(user);

      if (authCheck.isAuthorized && authCheck.adminDoc) {
        setAdminUser(authCheck.adminDoc);
        setIsAdminAuthorized(true);
        setCurrentUser(user);
        setCurrentRole(authCheck.adminDoc.role as UserRole);

        await logAdminEvent("admin_login", "auth", user.uid, authCheck.adminDoc.email, "Admin successfully signed in");
        addNotification({
          title: "🔐 Admin Access Granted",
          message: `Welcome, ${authCheck.adminDoc.displayName || authCheck.adminDoc.email}`,
          type: "system",
        });
        setAdminAuthLoading(false);
        return { success: true };
      } else {
        await logoutUser();
        setAdminUser(null);
        setIsAdminAuthorized(false);
        const errMsg = "User not authorized: This account does not have active administrative privileges.";
        setAdminAuthError(errMsg);
        setAdminAuthLoading(false);
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      let friendlyError = "Invalid credentials. Please verify your email and password.";
      const code = err?.code || "";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        friendlyError = "Invalid credentials. Please check your email and password.";
      } else if (code === "auth/too-many-requests") {
        friendlyError = "Too many failed attempts. Access is temporarily locked. Please try again later.";
      } else if (code === "auth/network-request-failed") {
        friendlyError = "Network error: Unable to connect to Firebase authentication servers.";
      } else if (code === "auth/invalid-email") {
        friendlyError = "Please enter a valid email address.";
      }

      setAdminAuthError(friendlyError);
      setAdminAuthLoading(false);
      return { success: false, error: friendlyError };
    }
  };

  const logoutAdmin = async () => {
    if (adminUser) {
      await logAdminEvent("admin_logout", "auth", adminUser.uid, adminUser.email, "Admin signed out");
    }
    await logoutUser();
    setCurrentUser(null);
    setAdminUser(null);
    setIsAdminAuthorized(false);
    setAdminAuthError(null);
    setAdminRoute("dashboard");
    addNotification({
      title: "👋 Signed Out",
      message: "Admin session closed.",
      type: "system",
    });
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await resetAdminPassword(email);
      addNotification({
        title: "📧 Reset Email Sent",
        message: `Password reset instructions sent to ${email}`,
        type: "system",
      });
      return { success: true };
    } catch (err: any) {
      let msg = "Failed to send reset email. Please ensure the email is registered.";
      if (err?.code === "auth/user-not-found") msg = "No administrative account found with that email.";
      return { success: false, error: msg };
    }
  };

  // 9. Categories Management Handlers
  const addCategory = async (catData: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    const newId = `cat-${Date.now()}`;
    const now = new Date().toISOString();
    const newCat: Category = {
      ...catData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    setCategories((prev) => {
      const next = [...prev, newCat];
      return next.sort((a, b) => a.sortOrder - b.sortOrder);
    });

    try {
      await setDoc(doc(db, "categories", newId), newCat);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `categories/${newId}`);
    }

    await logAdminEvent("create_category", "category", newId, newCat.name, `Created category "${newCat.name}"`);
    addNotification({
      title: "📁 Category Created",
      message: `"${newCat.name}" added to category catalog.`,
      type: "system",
    });
    return newId;
  };

  const updateCategory = async (id: string, updatedFields: Partial<Category>) => {
    const now = new Date().toISOString();
    const cleanUpdates = { ...updatedFields, updatedAt: now };

    setCategories((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, ...cleanUpdates } : c))
        .sort((a, b) => a.sortOrder - b.sortOrder)
    );

    try {
      await updateDoc(doc(db, "categories", id), cleanUpdates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `categories/${id}`);
    }

    const cat = categories.find((c) => c.id === id);
    await logAdminEvent("update_category", "category", id, cat?.name || id, `Updated category fields`);
    addNotification({
      title: "📁 Category Updated",
      message: `Category changes saved successfully.`,
      type: "system",
    });
  };

  const getCategoryItemCounts = (categoryId: string) => {
    const targetCat = categories.find((c) => c.id === categoryId);
    const catName = targetCat?.name || "";

    const productsCount = products.filter(
      (p) => p.categoryId === categoryId || p.category.toLowerCase() === catName.toLowerCase()
    ).length;

    const gamesCount = games.filter(
      (g) => g.categoryId === categoryId || g.category.toLowerCase() === catName.toLowerCase()
    ).length;

    return { productsCount, gamesCount, total: productsCount + gamesCount };
  };

  const deleteCategory = async (id: string, moveItemsToCategoryId?: string): Promise<boolean> => {
    const targetCat = categories.find((c) => c.id === id);
    if (!targetCat) return false;

    // Handle item reassignment if requested
    if (moveItemsToCategoryId) {
      const destCat = categories.find((c) => c.id === moveItemsToCategoryId);
      if (destCat) {
        // Reassign products
        setProducts((prev) =>
          prev.map((p) =>
            p.categoryId === id || p.category.toLowerCase() === targetCat.name.toLowerCase()
              ? { ...p, categoryId: destCat.id, category: destCat.name }
              : p
          )
        );
        // Reassign games
        setGames((prev) =>
          prev.map((g) =>
            g.categoryId === id || g.category.toLowerCase() === targetCat.name.toLowerCase()
              ? { ...g, categoryId: destCat.id, category: destCat.name }
              : g
          )
        );
      }
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));

    try {
      await deleteDoc(doc(db, "categories", id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `categories/${id}`);
    }

    await logAdminEvent("delete_category", "category", id, targetCat.name, `Deleted category "${targetCat.name}"`);
    addNotification({
      title: "🗑️ Category Deleted",
      message: `Category "${targetCat.name}" has been removed.`,
      type: "system",
    });
    return true;
  };

  // 10. Products CRUD Handlers
  const addProduct = async (prodData: Omit<DigitalProduct, "id">): Promise<string> => {
    const newId = `prod-${Date.now()}`;
    const now = new Date().toISOString();
    const newProd: DigitalProduct = {
      ...prodData,
      id: newId,
      status: prodData.status || "published",
      currency: prodData.currency || "BDT",
      imageUrl: prodData.imageUrl || prodData.thumbnail,
      createdAt: now,
      updatedAt: now,
      createdBy: adminUser?.email || currentUser?.email || "Admin",
    };

    setProducts((prev) => [newProd, ...prev]);

    try {
      await setDoc(doc(db, "products", newId), newProd);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `products/${newId}`);
    }

    await logAdminEvent("create_product", "product", newId, newProd.title, `Published product "${newProd.title}"`);
    addNotification({
      title: "📦 Product Listed",
      message: `"${newProd.title}" is now available in store.`,
      type: "system",
    });
    return newId;
  };

  const updateProduct = async (id: string, updatedFields: Partial<DigitalProduct>) => {
    const now = new Date().toISOString();
    const cleanUpdates = {
      ...updatedFields,
      updatedAt: now,
      updatedBy: adminUser?.email || currentUser?.email || "Admin",
    };

    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...cleanUpdates } : p)));

    try {
      await updateDoc(doc(db, "products", id), cleanUpdates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `products/${id}`);
    }

    const prod = products.find((p) => p.id === id);
    await logAdminEvent("update_product", "product", id, prod?.title || id, `Updated product details`);
    addNotification({
      title: "📦 Product Updated",
      message: `Product details saved to database.`,
      type: "system",
    });
  };

  const deleteProduct = async (id: string) => {
    const targetProd = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await deleteDoc(doc(db, "products", id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `products/${id}`);
    }

    await logAdminEvent("delete_product", "product", id, targetProd?.title || id, `Deleted product "${targetProd?.title}"`);
    addNotification({
      title: "🗑️ Product Deleted",
      message: `Product "${targetProd?.title || id}" removed from inventory.`,
      type: "system",
    });
  };

  const bulkUpdateProducts = async (ids: string[], updates: Partial<DigitalProduct>) => {
    const now = new Date().toISOString();
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, ...updates, updatedAt: now } : p))
    );

    for (const id of ids) {
      try {
        await updateDoc(doc(db, "products", id), { ...updates, updatedAt: now });
      } catch (e) {
        console.warn(`Bulk update error on ${id}:`, e);
      }
    }

    await logAdminEvent("bulk_update_products", "product", undefined, `${ids.length} products`, `Bulk updated ${ids.length} items`, { ids, updates });
    addNotification({
      title: "⚡ Bulk Updated",
      message: `${ids.length} products successfully updated.`,
      type: "system",
    });
  };

  const bulkDeleteProducts = async (ids: string[]) => {
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));

    for (const id of ids) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (e) {
        console.warn(`Bulk delete error on ${id}:`, e);
      }
    }

    await logAdminEvent("bulk_delete_products", "product", undefined, `${ids.length} products`, `Bulk deleted ${ids.length} items`, { ids });
    addNotification({
      title: "🗑️ Bulk Deleted",
      message: `${ids.length} products removed permanently.`,
      type: "system",
    });
  };

  const bulkPublishProducts = async (ids: string[], publish: boolean) => {
    const newStatus = publish ? "published" : "draft";
    await bulkUpdateProducts(ids, { status: newStatus });
  };

  // 11. Games Handlers
  const addGame = async (gameData: Omit<Game, "id">): Promise<string> => {
    const newId = `game-${Date.now()}`;
    const newGame: Game = { ...gameData, id: newId };
    setGames((prev) => [newGame, ...prev]);

    try {
      await setDoc(doc(db, "games", newId), newGame);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `games/${newId}`);
    }

    await logAdminEvent("create_game", "game", newId, newGame.title, `Published game "${newGame.title}"`);
    addNotification({
      title: "🎮 Game Added",
      message: `${newGame.title} (v${newGame.version}) is live.`,
      type: "system",
    });
    return newId;
  };

  const updateGame = async (id: string, updatedFields: Partial<Game>) => {
    setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...updatedFields } : g)));

    try {
      await updateDoc(doc(db, "games", id), updatedFields);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `games/${id}`);
    }

    const g = games.find((x) => x.id === id);
    await logAdminEvent("update_game", "game", id, g?.title || id, `Updated game configuration`);
    addNotification({
      title: "🎮 Game Updated",
      message: `Game settings saved.`,
      type: "system",
    });
  };

  const deleteGame = async (id: string) => {
    const targetGame = games.find((g) => g.id === id);
    setGames((prev) => prev.filter((g) => g.id !== id));

    try {
      await deleteDoc(doc(db, "games", id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `games/${id}`);
    }

    await logAdminEvent("delete_game", "game", id, targetGame?.title || id, `Deleted game "${targetGame?.title}"`);
    addNotification({
      title: "🗑️ Game Deleted",
      message: `Game removed from directory.`,
      type: "system",
    });
  };

  // 12. Portfolio Projects
  const addProject = async (projData: Omit<PortfolioProject, "id">): Promise<string> => {
    const newId = `proj-${Date.now()}`;
    const newProj: PortfolioProject = { ...projData, id: newId };
    setProjects((prev) => [newProj, ...prev]);

    try {
      await setDoc(doc(db, "portfolioProjects", newId), newProj);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `portfolioProjects/${newId}`);
    }

    await logAdminEvent("create_project", "portfolio", newId, newProj.title, `Added portfolio project "${newProj.title}"`);
    return newId;
  };

  const updateProject = async (id: string, updatedFields: Partial<PortfolioProject>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)));
    try {
      await updateDoc(doc(db, "portfolioProjects", id), updatedFields);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `portfolioProjects/${id}`);
    }
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, "portfolioProjects", id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `portfolioProjects/${id}`);
    }
  };

  const updateSkill = (id: string, updatedFields: Partial<PortfolioSkill>) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s)));
  };

  const addSkill = (skill: Omit<PortfolioSkill, "id">) => {
    const newSkill = { ...skill, id: `skill-${Date.now()}` };
    setSkills((prev) => [...prev, newSkill]);
  };

  const deleteSkill = (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  };

  // 13. Site Config
  const updateSiteConfig = async (newConfig: Partial<SiteConfig>) => {
    const updated = { ...siteConfig, ...newConfig };
    setSiteConfig(updated);
    try {
      await setDoc(doc(db, "siteConfig", "main"), updated, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "siteConfig/main");
    }

    await logAdminEvent("update_settings", "settings", "main", "Site Config", "Updated global site settings & SEO");
  };

  const resetSiteConfig = () => {
    setSiteConfig(initialSiteConfig);
    localStorage.removeItem("gamehub_site_config");
  };

  // 14. RBAC Helpers
  const hasPermission = (permission: Permission): boolean => {
    const permissions = rolePermissions[currentRole] || DEFAULT_ROLE_PERMISSIONS[currentRole] || [];
    return permissions.includes(permission);
  };
  const can = hasPermission;

  const updateRolePermission = (role: UserRole, permission: Permission, allowed: boolean) => {
    setRolePermissions((prev) => {
      const currentList = prev[role] || DEFAULT_ROLE_PERMISSIONS[role] || [];
      const updatedList = allowed
        ? Array.from(new Set([...currentList, permission]))
        : currentList.filter((p) => p !== permission);
      return {
        ...prev,
        [role]: updatedList,
      };
    });
  };

  const resetRolePermissions = () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    localStorage.removeItem("gamehub_role_permissions");
  };

  // 15. Wishlist Helpers
  const isInWishlist = (id: string): boolean => wishlist.includes(id);

  const toggleWishlist = (id: string, itemTitle?: string) => {
    const exists = wishlist.includes(id);
    let titleToDisplay = itemTitle;
    if (!titleToDisplay) {
      const g = games.find((x) => x.id === id);
      const p = products.find((x) => x.id === id);
      titleToDisplay = g?.title || p?.title || "Item";
    }

    if (exists) {
      setWishlist((prev) => prev.filter((item) => item !== id));
      addNotification({
        title: "❤️ Removed from Wishlist",
        message: `${titleToDisplay} removed from saved list.`,
        type: "system",
      });
    } else {
      setWishlist((prev) => [...prev, id]);
      addNotification({
        title: "💖 Added to Wishlist",
        message: `${titleToDisplay} saved to your wishlist.`,
        type: "system",
      });
    }
  };

  const moveWishlistItemToCart = (id: string) => {
    const game = games.find((g) => g.id === id);
    if (game) {
      addToCart({
        id: game.id,
        title: game.title,
        price: game.discountPrice || game.price,
        thumbnail: game.coverImage,
        type: "game",
        fileName: game.fileName,
        fileSize: game.fileSize,
      });
      setWishlist((prev) => prev.filter((item) => item !== id));
      setIsCartOpen(true);
      return;
    }

    const product = products.find((p) => p.id === id);
    if (product) {
      addToCart({
        id: product.id,
        title: product.title,
        price: product.discountPrice || product.price,
        thumbnail: product.thumbnail,
        type: "product",
        fileName: product.fileName,
        fileSize: product.fileSize,
        licenseType: product.licenseType,
      });
      setWishlist((prev) => prev.filter((item) => item !== id));
      setIsCartOpen(true);
    }
  };

  const clearWishlist = () => setWishlist([]);

  // 16. Reviews
  const addReview = async (reviewData: Omit<Review, "id" | "createdAt">) => {
    const newId = `rev-${Date.now()}`;
    const newRev: Review = {
      ...reviewData,
      id: newId,
      createdAt: new Date().toISOString(),
      status: reviewData.status || "approved",
      helpfulVotes: 0,
    };

    setReviews((prev) => [newRev, ...prev]);

    try {
      await setDoc(doc(db, "reviews", newId), newRev);
    } catch (e) {
      // offline resilient
    }
  };

  const updateReviewStatus = async (id: string, status: "approved" | "pending" | "flagged" | "hidden") => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await updateDoc(doc(db, "reviews", id), { status });
    } catch (e) {
      // ignore
    }
  };

  const deleteReview = async (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteDoc(doc(db, "reviews", id));
    } catch (e) {
      // ignore
    }
  };

  const voteHelpful = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulVotes: (r.helpfulVotes || 0) + 1 } : r))
    );
  };

  // 17. Cart & Orders
  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    addNotification({
      title: "🛒 Added to Cart",
      message: `${item.title} added to shopping cart.`,
      type: "order",
    });
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  const createOrder = async (orderData: Omit<Order, "id" | "createdAt" | "downloadTokens" | "licenseKeys">): Promise<Order> => {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const licenseKeys: Record<string, string> = {};
    const downloadTokens: Record<string, string> = {};

    for (const item of orderData.items) {
      licenseKeys[item.id] = `CXT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      downloadTokens[item.id] = `TOK-${Math.random().toString(36).substring(2, 12)}`;
    }

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: new Date().toISOString(),
      licenseKeys,
      downloadTokens,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    try {
      await setDoc(doc(db, "orders", orderId), newOrder);
    } catch (e) {
      // offline resilient
    }

    addNotification({
      title: "✅ Order Confirmed",
      message: `Order #${orderId.slice(0, 12)} completed successfully.`,
      type: "order",
    });

    return newOrder;
  };

  // 18. Google Auth Login for regular users
  const loginWithGoogle = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        if (res.accessToken) setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
    }
  };

  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setAccessToken(null);
    setUserProfile(null);
    setAdminUser(null);
    setIsAdminAuthorized(false);
  };

  // 19. Notifications
  const addNotification = (notif: Omit<NotificationItem, "id" | "timestamp" | "read">) => {
    const newItem: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    setNotifications((prev) => [newItem, ...prev.slice(0, 19)]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // 20. Secure Expiring Download Token Generator
  const generateSecureDownload = async (item: {
    id: string;
    title: string;
    fileName: string;
    fileSize: string;
    fileUrl: string;
    type: "game" | "product";
  }) => {
    try {
      const res = await fetch("/api/downloads/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          itemType: item.type,
          fileName: item.fileName,
          fileSize: item.fileSize,
          fileUrl: item.fileUrl,
          userEmail: currentUser?.email || "guest@gamehubcxt.io",
        }),
      });
      if (!res.ok) throw new Error("Token generation fallback");
      const data = await res.json();
      return {
        token: data.token,
        downloadUrl: data.downloadUrl,
        expiresInMinutes: data.expiresInMinutes,
      };
    } catch (e) {
      const token = Math.random().toString(36).substring(2, 15);
      return {
        token,
        downloadUrl: `/api/downloads/file/${token}`,
        expiresInMinutes: 30,
      };
    }
  };

  return (
    <AppContext.Provider
      value={{
        siteConfig,
        updateSiteConfig,
        resetSiteConfig,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryItemCounts,
        games,
        addGame,
        updateGame,
        deleteGame,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        bulkUpdateProducts,
        bulkDeleteProducts,
        bulkPublishProducts,
        projects,
        addProject,
        updateProject,
        deleteProject,
        skills,
        updateSkill,
        addSkill,
        deleteSkill,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        orders,
        createOrder,
        reviews,
        addReview,
        updateReviewStatus,
        deleteReview,
        voteHelpful,
        currentUser,
        currentRole,
        setCurrentRole,
        rolePermissions,
        updateRolePermission,
        resetRolePermissions,
        hasPermission,
        can,
        userProfile,
        loginWithGoogle,
        logout,
        accessToken,
        adminUser,
        isAdminAuthorized,
        adminAuthLoading,
        adminAuthError,
        loginAdmin,
        logoutAdmin,
        requestPasswordReset,
        adminRoute,
        setAdminRoute,
        adminTargetId,
        auditLogs,
        logAdminEvent,
        wishlist,
        toggleWishlist,
        isInWishlist,
        moveWishlistItemToCart,
        clearWishlist,
        notifications,
        addNotification,
        markNotificationAsRead,
        removeNotification,
        generateSecureDownload,
        isAiModalOpen,
        setIsAiModalOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        isCartOpen,
        setIsCartOpen,
        activeView,
        setActiveView,
        selectedGameId,
        setSelectedGameId,
        selectedProductId,
        setSelectedProductId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
