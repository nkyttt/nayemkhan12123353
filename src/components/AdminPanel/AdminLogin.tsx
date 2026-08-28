import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Lock,
  Mail,
  Key,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ArrowLeft,
  Terminal,
} from "lucide-react";

export const AdminLogin: React.FC = () => {
  const { loginAdmin, requestPasswordReset, adminAuthLoading, adminAuthError, setActiveView } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<{ sent: boolean; message?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError("Please enter your admin email address.");
      return;
    }
    if (!password) {
      setLocalError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    const result = await loginAdmin(email.trim(), password);
    setIsSubmitting(false);

    if (!result.success && result.error) {
      setLocalError(result.error);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetStatus({ sent: false, message: "Please enter an email address." });
      return;
    }
    setIsSubmitting(true);
    const res = await requestPasswordReset(resetEmail.trim());
    setIsSubmitting(false);
    if (res.success) {
      setResetStatus({
        sent: true,
        message: "Password reset email sent! Check your inbox to create a new password.",
      });
    } else {
      setResetStatus({
        sent: false,
        message: res.error || "Unable to send reset email. Verify this address is registered.",
      });
    }
  };

  const handleFastPrefill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("AdminPass2026!");
    setLocalError(null);
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12">
      {/* Background Decorative Ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card Container */}
        <div className="rounded-2xl bg-neutral-900/90 border border-white/10 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          {/* Header Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/40 text-orange-400 mb-4 shadow-[0_0_25px_rgba(249,115,22,0.3)]">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase font-mono">
              GAMEHUB CXT <span className="text-orange-500">ADMIN</span>
            </h1>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Production-Grade Administration & RBAC Portal
            </p>
          </div>

          {!showForgotPassword ? (
            /* Sign In Form */
            <form onSubmit={handleSignIn} className="space-y-5">
              {/* Error Box */}
              {(localError || adminAuthError) && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{localError || adminAuthError}</div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-neutral-300 uppercase tracking-wider">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLocalError(null);
                    }}
                    placeholder="admin@gamehubcxt.io"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-medium text-neutral-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setResetEmail(email);
                      setResetStatus(null);
                    }}
                    className="text-[11px] font-mono text-orange-400 hover:text-orange-300 hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLocalError(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono transition-all"
                  />
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isSubmitting || adminAuthLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-sm tracking-wider uppercase font-mono shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isSubmitting || adminAuthLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Authorization...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Panel</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              {/* Return to Public Site */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveView("home")}
                  className="text-xs text-neutral-400 hover:text-white font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Public GameHub Store</span>
                </button>
              </div>

              {/* Security Notice & Quick Fastfill for verified Owner */}
              <div className="mt-6 pt-5 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span>Authorized Personnel Only • RBAC Monitored</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/5 space-y-2">
                  <div className="text-[10px] uppercase font-mono text-neutral-400 flex items-center justify-between">
                    <span>Quick Access (Configured Admin)</span>
                    <Sparkles className="w-3 h-3 text-orange-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFastPrefill("nkoffcil27@gmail.com")}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-orange-500/20 text-xs font-mono text-neutral-300 hover:text-orange-300 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span>nkoffcil27@gmail.com</span>
                    <span className="text-[10px] text-orange-400 uppercase font-bold opacity-75 group-hover:opacity-100">
                      Owner
                    </span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Forgot Password Flow */
            <form onSubmit={handleResetPassword} className="space-y-5 animate-in fade-in">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-white font-mono">Reset Admin Password</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Enter your registered admin email. We will send a secure Firebase recovery link.
                </p>
              </div>

              {resetStatus && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
                    resetStatus.sent
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : "bg-red-950/40 border-red-500/40 text-red-300"
                  }`}
                >
                  {resetStatus.sent ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="leading-relaxed">{resetStatus.message}</div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-neutral-300 uppercase tracking-wider">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="admin@gamehubcxt.io"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Password Reset Email</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-xs font-mono text-neutral-400 hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
