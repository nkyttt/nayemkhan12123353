import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  ShoppingCart,
  Trash2,
  X,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Download,
  Mail,
  Send,
  Sparkles,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";
import { sendOrderReceiptViaGmail } from "../services/gmailService";

export const CartAndCheckoutModal: React.FC = () => {
  const {
    cart,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    createOrder,
    currentUser,
    accessToken,
    addNotification,
  } = useApp();

  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  // Customer Checkout Form
  const [customerName, setCustomerName] = useState(currentUser?.displayName || "Alex Mercer");
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || "alex@cyberpunk.io");
  const [customerPhone, setCustomerPhone] = useState("+8801700000000");
  const [paymentMethod, setPaymentMethod] = useState<"bKash" | "Nagad" | "Rocket" | "Credit Card" | "Crypto">("bKash");
  const [mobileTrxId, setMobileTrxId] = useState("8N76GF89Q");
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Gmail Confirmation Dialog State (Mandatory User Confirmation for Workspace Operations)
  const [showGmailConfirmModal, setShowGmailConfirmModal] = useState(false);
  const [isSendingGmail, setIsSendingGmail] = useState(false);
  const [gmailSentSuccess, setGmailSentSuccess] = useState(false);

  if (!isCartOpen) return null;

  const rawSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "SAVE20") {
      setDiscountPercent(20);
      setCouponMessage("✅ 20% Discount applied!");
    } else if (code === "LAUNCH50") {
      setDiscountPercent(50);
      setCouponMessage("✅ 50% Launch discount applied!");
    } else if (code === "CYBER100") {
      setDiscountPercent(100);
      setCouponMessage("✅ 100% Free checkout voucher!");
    } else {
      setCouponMessage("❌ Invalid coupon code.");
    }
  };

  const handleCompleteOrder = async () => {
    const order = await createOrder({
      userId: currentUser?.uid || "guest",
      customerName,
      customerEmail,
      customerPhone,
      totalAmount: finalTotal,
      discountApplied: discountAmount,
      couponCode: discountPercent > 0 ? couponCode : undefined,
      paymentMethod: finalTotal === 0 ? "Free Checkout" : paymentMethod,
      paymentStatus: "completed",
      transactionId: mobileTrxId || `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      items: cart.map((i) => ({
        id: i.id,
        title: i.title,
        price: i.price,
        type: i.type,
        fileName: i.fileName,
        fileSize: i.fileSize,
        licenseType: i.licenseType,
        thumbnail: i.thumbnail,
      })),
    });

    setCreatedOrder(order);
    setStep("success");

    // Launch celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleSendGmailReceipt = async () => {
    if (!createdOrder) return;
    setIsSendingGmail(true);
    try {
      if (accessToken) {
        await sendOrderReceiptViaGmail({
          accessToken,
          recipientEmail: customerEmail,
          customerName,
          orderId: createdOrder.id,
          totalAmount: finalTotal,
          items: createdOrder.items,
        });
        setGmailSentSuccess(true);
        setShowGmailConfirmModal(false);
        addNotification({
          title: "📧 Gmail Receipt Sent",
          message: `Order confirmation dispatched to ${customerEmail} via Gmail.`,
          type: "email",
        });
      } else {
        // Fallback simulation if user hasn't completed Google OAuth sign-in
        setGmailSentSuccess(true);
        setShowGmailConfirmModal(false);
        addNotification({
          title: "📧 Receipt Generated",
          message: `Receipt formatted and logged for ${customerEmail}.`,
          type: "email",
        });
      }
    } catch (error: any) {
      console.error("Gmail send error:", error);
      alert(`Could not send email via Gmail: ${error.message}`);
    } finally {
      setIsSendingGmail(false);
    }
  };

  return (
    <div
      id="cart-checkout-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="bg-[#0e1526] border border-cyan-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-950">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white font-mono uppercase">
              {step === "cart" && "Your Shopping Cart"}
              {step === "checkout" && "Instant Checkout & Verification"}
              {step === "success" && "Order Completed"}
            </h3>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setStep("cart");
            }}
            className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CART ITEMS */}
        {step === "cart" && (
          <div className="py-6 space-y-6 flex-1">
            {cart.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-sm font-mono">Your cart is currently empty.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/40"
                >
                  Explore Games & Assets
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-[#090d16] border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <img
                        src={item.thumbnail}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate font-mono">{item.title}</h4>
                        <p className="text-xs text-slate-400 font-mono">
                          {item.fileName} {item.licenseType && `• ${item.licenseType} License`}
                        </p>
                        <span className="text-xs text-cyan-400 font-bold font-mono">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-slate-500 hover:text-red-400"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Coupon input */}
                <div className="pt-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. SAVE20, LAUNCH50)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#090d16] border border-slate-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className="text-xs font-mono text-cyan-300">{couponMessage}</p>
                )}

                {/* Price Breakdown */}
                <div className="pt-3 border-t border-slate-800 space-y-1.5 font-mono text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-white">${rawSubtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Coupon Discount ({discountPercent}%):</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800/60">
                    <span>Total Amount:</span>
                    <span className="text-cyan-400 text-lg">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep("checkout")}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout (${finalTotal.toFixed(2)})</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* STEP 2: CHECKOUT & PAYMENT SELECTION */}
        {step === "checkout" && (
          <div className="py-6 space-y-5 flex-1 animate-in fade-in">
            {/* Customer Inputs */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">
                1. Delivery & License Holder Info
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="p-2.5 rounded-xl bg-[#090d16] border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="email"
                  placeholder="Email for License & Download Link"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="p-2.5 rounded-xl bg-[#090d16] border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Payment Method Selector (Bangladesh & Global) */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">
                2. Select Payment Gateway
              </span>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 font-mono text-xs">
                {(["bKash", "Nagad", "Rocket", "Credit Card", "Crypto"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === method
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                        : "border-slate-800 bg-[#090d16] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span className="text-[11px] truncate w-full">{method}</span>
                  </button>
                ))}
              </div>

              {/* Payment Details Simulator */}
              {(paymentMethod === "bKash" || paymentMethod === "Nagad" || paymentMethod === "Rocket") && (
                <div className="p-3.5 rounded-xl bg-[#090d16] border border-cyan-900/60 text-xs font-mono space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Merchant Number:</span>
                    <strong className="text-cyan-400">+880 1888-GAMEHUB</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total BDT Equivalent:</span>
                    <strong className="text-emerald-400">৳{(finalTotal * 120).toFixed(0)} BDT</strong>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Transaction ID (TrxID):</label>
                    <input
                      type="text"
                      value={mobileTrxId}
                      onChange={(e) => setMobileTrxId(e.target.value)}
                      placeholder="e.g. 8N76GF89Q"
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white uppercase text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Total and Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setStep("cart")}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Back to Cart
              </button>

              <button
                onClick={handleCompleteOrder}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider shadow-[0_0_20px_rgba(72,187,120,0.5)] flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Authorize (${finalTotal.toFixed(2)})</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ORDER SUCCESS & INSTANT DOWNLOADS */}
        {step === "success" && createdOrder && (
          <div className="py-6 space-y-6 flex-1 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_25px_rgba(72,187,120,0.5)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-white font-mono">Payment Successful!</h4>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Order ID: <span className="text-cyan-400 font-bold">{createdOrder.id}</span>
              </p>
            </div>

            {/* Generated License Keys & Download Links */}
            <div className="p-4 rounded-2xl bg-[#090d16] border border-cyan-950 text-left space-y-3 max-h-56 overflow-y-auto">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">
                Your Purchased Items & License Keys
              </span>

              {createdOrder.items.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-xs font-mono"
                >
                  <div className="flex justify-between font-bold text-white">
                    <span>{item.title}</span>
                    <span className="text-emerald-400">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    License: <span className="text-amber-400 font-mono">{createdOrder.licenseKeys[item.id]}</span>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <a
                      href={`/api/downloads/file/${createdOrder.downloadTokens[item.id] || "tok-demo"}`}
                      download={item.fileName}
                      className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] flex items-center gap-1.5"
                    >
                      <Download className="w-3 h-3" /> Download {item.fileName}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Gmail Confirmation Feature Button */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setShowGmailConfirmModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4 text-purple-400" />
                <span>{gmailSentSuccess ? "Receipt Dispatched" : "Email Receipt via Gmail"}</span>
              </button>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setStep("cart");
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs font-mono uppercase"
              >
                Finish & Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Explicit User Confirmation Dialog for Gmail Workspace Operation (MANDATORY per Workspace Skill) */}
      {showGmailConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0e1526] border border-purple-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 text-purple-400">
              <Mail className="w-6 h-6" />
              <h4 className="text-base font-bold text-white font-mono">
                Confirm Gmail Dispatch
              </h4>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Are you sure you want to send the official order receipt and software license keys to{" "}
              <strong className="text-cyan-300">{customerEmail}</strong> from your authorized Gmail account?
            </p>

            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div><strong>Subject:</strong> ⚡ Your GameHub CXT Order Confirmation</div>
              <div><strong>Items:</strong> {createdOrder?.items?.length} products included</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowGmailConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleSendGmailReceipt}
                disabled={isSendingGmail}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingGmail ? "Sending..." : "Confirm & Send"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
