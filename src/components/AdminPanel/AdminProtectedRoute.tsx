import React from "react";
import { useApp } from "../../context/AppContext";
import { AdminLogin } from "./AdminLogin";
import { ShieldAlert, Loader2, Sparkles } from "lucide-react";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAdminAuthorized, adminAuthLoading, adminUser, currentUser } = useApp();

  // 1. Loading State - prevent flashing unauthorized content
  if (adminAuthLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.2)] animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mt-6">
          Verifying Admin Authorization...
        </h3>
        <p className="text-xs font-mono text-neutral-500 mt-1">
          Querying secure permissions in Firestore admins registry
        </p>
      </div>
    );
  }

  // 2. Unauthenticated or Unauthorized -> Render Hardened Admin Login
  if (!isAdminAuthorized || !adminUser) {
    return <AdminLogin />;
  }

  // 3. Authorized -> Render Protected Admin Panel
  return <>{children}</>;
};
