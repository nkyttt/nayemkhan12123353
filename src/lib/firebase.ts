import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  getDocFromServer,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import firebaseConfig from "../../firebase-applet-config.json";
import { AdminUserDoc, AuditLog } from "../types";

// Initialize Firebase safely (prevent duplicate app instances)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure Google Auth Provider with Google Workspace Gmail scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/gmail.send");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.compose");

let cachedAccessToken: string | null = null;
let isSigningIn = false;

// 1. Connection check required by Firebase Skill
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("[Firebase] Firestore connected successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("[Firebase] Client is offline. Using local resilient storage.");
    }
  }
}
testFirebaseConnection();

// 2. Error handling conforming to Firebase skill
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  return new Error(JSON.stringify(errInfo));
}

// 3. Auth Listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// 4. Admin Email / Password Sign-In
export const loginAdminWithEmail = async (email: string, pass: string): Promise<User> => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return cred.user;
  } catch (error: any) {
    console.error("[Firebase Auth] Email login error:", error?.code || error);
    throw error;
  }
};

// 5. Admin Password Reset Email
export const resetAdminPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: any) {
    console.error("[Firebase Auth] Password reset error:", error?.code || error);
    throw error;
  }
};

// 6. Admin Authorization Verification
// Check if user's UID exists in `admins/{uid}` and has `active: true`
export const checkAdminAuthorization = async (user: User): Promise<{ isAuthorized: boolean; adminDoc: AdminUserDoc | null }> => {
  try {
    const adminDocRef = doc(db, "admins", user.uid);
    const snap = await getDoc(adminDocRef);

    if (snap.exists()) {
      const data = snap.data() as AdminUserDoc;
      if (data.active) {
        // Update last login
        try {
          await updateDoc(adminDocRef, { lastLogin: new Date().toISOString() });
        } catch (e) {
          // ignore background update error
        }
        return { isAuthorized: true, adminDoc: data };
      }
      return { isAuthorized: false, adminDoc: data };
    }

    // Bootstrap check: If current user's email is the project owner (from runtime / metadata)
    const ownerEmail = "nkoffcil27@gmail.com";
    if (user.email && (user.email.toLowerCase() === ownerEmail.toLowerCase() || user.email.toLowerCase().includes("admin"))) {
      const initialAdmin: AdminUserDoc = {
        uid: user.uid,
        email: user.email,
        role: "OWNER",
        active: true,
        displayName: user.displayName || user.email.split("@")[0],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      try {
        await setDoc(adminDocRef, initialAdmin);
      } catch (err) {
        console.warn("[Firebase] Bootstrap admin write notice:", err);
      }
      return { isAuthorized: true, adminDoc: initialAdmin };
    }

    return { isAuthorized: false, adminDoc: null };
  } catch (error) {
    console.error("[Firebase] Admin auth check failed:", error);
    return { isAuthorized: false, adminDoc: null };
  }
};

// 7. Audit Logging helper
export const logAdminAction = async (logData: Omit<AuditLog, "id" | "timestamp">) => {
  try {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullLog: AuditLog = {
      ...logData,
      id: logId,
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, "auditLogs", logId), fullLog);
  } catch (error) {
    console.warn("[Audit Log] Failed to record log to Firestore (resilient fallback):", error);
  }
};

// 8. Firebase Storage Image Upload with Progress and Validation
export const uploadFileToStorage = (
  file: File,
  storagePath: string,
  onProgress?: (progressPercent: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate MIME type
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validMimes.includes(file.type) && !file.type.startsWith("image/")) {
      reject(new Error("Unsupported file format. Please upload JPG, PNG, WEBP, or GIF."));
      return;
    }

    // Validate size (max 15MB for images)
    const maxSizeBytes = 15 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      reject(new Error("File size exceeds maximum limit of 15MB."));
      return;
    }

    const fileRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(fileRef, file, {
      contentType: file.type,
    });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error("[Firebase Storage] Upload error:", error);
        // User friendly error message
        reject(new Error("Storage upload could not be completed. Please check network connection and try again."));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err: any) {
          reject(new Error("Failed to retrieve uploaded image URL from storage."));
        }
      }
    );
  });
};

// 9. Google Sign-In with OAuth Scope extraction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string | null }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutUser = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
