"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Gossip {
  id: string;
  title: string;
  creatorRank: number;
  sentenceCount: number;
}

function GossipsListAfterPayment({ paymentId, rank }: { paymentId: string; rank: number }) {
  const [gossips, setGossips] = useState<Gossip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gossips")
      .then((res) => res.json())
      .then((data) => {
        setGossips(data.gossips || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleShare = () => {
    const shareText = `I paid ₹1 and got ranked #${rank} on GreedChain. See where you stand.`;
    const shareUrl = window.location.origin;

    navigator.share?.({
      title: "GreedChain",
      text: shareText,
      url: shareUrl,
    }) || navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
  };

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome</h1>
          <p className="mb-4 opacity-80">
            You paid ₹1. Rank #{rank}
          </p>
          <p className="text-sm opacity-60 mb-6">
            You can add ONE sentence to any gossip. Max 30 characters. No edits.
          </p>
          <button
            onClick={handleShare}
            className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Share & Challenge Friends
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-6">Gossips</h2>

        {loading ? (
          <p className="text-center opacity-60">Loading gossips...</p>
        ) : gossips.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl mb-4 opacity-60">No gossips yet.</p>
            <p className="text-sm opacity-40">
              Pay ₹2 from any gossip page to start the first one.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {gossips.map((gossip) => (
              <Link
                key={gossip.id}
                href={`/gossips/${gossip.id}?payment_id=${paymentId}`}
                className="block border border-white/20 rounded-lg p-4 hover:border-white/40 transition-colors"
              >
                <h3 className="text-xl font-semibold mb-2">{gossip.title}</h3>
                <div className="flex items-center gap-4 text-sm opacity-60">
                  <span>#{gossip.creatorRank} origin</span>
                  <span>{gossip.sentenceCount} sentence{gossip.sentenceCount !== 1 ? 's' : ''}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function SuccessContent() {
    const params = useSearchParams();
    const router = useRouter();
    // Cashfree may return parameters in URL or we need to get from session/referrer
    const orderId = params.get("order_id");
    const paymentId = params.get("payment_id");
    const amountParam = params.get("amount");
    const redirectionTime = params.get("redirection_time");
    const [status, setStatus] = useState("verifying");
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        // Try to get payment info from URL params first
        let identifier = orderId || paymentId;
        let amount = amountParam;

        // If no params in URL, try to get from sessionStorage (set before redirect)
        if (!identifier) {
            const storedOrderId = sessionStorage.getItem("cashfree_order_id");
            const storedPaymentId = sessionStorage.getItem("cashfree_payment_id");
            const storedAmount = sessionStorage.getItem("cashfree_amount");
            
            identifier = storedOrderId || storedPaymentId;
            amount = storedAmount || amount;
            
            // Clean up session storage
            if (storedOrderId) sessionStorage.removeItem("cashfree_order_id");
            if (storedPaymentId) sessionStorage.removeItem("cashfree_payment_id");
            if (storedAmount) sessionStorage.removeItem("cashfree_amount");
        }

        // If still no identifier, check if we can determine amount from referrer
        if (!identifier && !amount) {
            // Check referrer to determine which payment form was used
            const referrer = document.referrer;
            if (referrer.includes("greed-chain")) {
                amount = "1"; // ₹1 payment form
            } else if (referrer.includes("create-greed-story")) {
                amount = "2"; // ₹2 payment form
            }
        }
        
        if (!identifier && !amount) {
            setError("Missing payment information. Please try again or contact support.");
            setStatus("failed");
            return;
        }

        // Build query string for Cashfree verification
        const queryParams = new URLSearchParams();
        if (identifier) {
            if (orderId || identifier.startsWith("order_")) {
                queryParams.append("order_id", identifier);
            } else {
                queryParams.append("payment_id", identifier);
            }
        }
        if (amount) {
            queryParams.append("amount", amount);
        }

        fetch(`/api/verify-payment-cashfree?${queryParams.toString()}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus("success");
                    setData(data);
                } else {
                    setError(data.error || "Payment verification failed");
                    setStatus("failed");
                }
            })
            .catch(err => {
                console.error("Payment verification error:", err);
                setError("Failed to verify payment");
                setStatus("failed");
            });
    }, [orderId, paymentId, amountParam, redirectionTime]);

    if (status === "verifying") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-black text-white">
                <h1>Verifying your payment…</h1>
            </main>
        );
    }

    if (status === "failed") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center max-w-md px-4">
                    <h1 className="text-2xl mb-4">Payment verification failed ❌</h1>
                    {error && (
                        <p className="text-sm opacity-60 mb-4">{error}</p>
                    )}
                    <Link href="/" className="text-blue-400 underline">
                        Go back
                    </Link>
                </div>
            </main>
        );
    }

    const paymentAmount = data?.amount || 0;
    const rank = data?.rank || 0;
    const verifiedPaymentId = data?.paymentId || orderId || paymentId;

    // ₹2 payment - Show create gossip option (only accessible from gossip page)
    if (paymentAmount === 2) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-black text-white p-4">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-3xl font-bold mb-6">Start a Gossip</h1>
                    <p className="mb-4 opacity-80">
                        You paid ₹2. Rank #{rank}
                    </p>
                    <p className="mb-8 text-sm opacity-60">
                        You can create ONE gossip. Choose your words carefully.
                    </p>
                    <Link
                        href={`/create-gossip?payment_id=${verifiedPaymentId}`}
                        className="block bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Create Gossip
                    </Link>
                    <Link
                        href={`/gossips?payment_id=${verifiedPaymentId}`}
                        className="block mt-4 text-blue-400 underline text-sm"
                    >
                        Back to gossips
                    </Link>
                </div>
            </main>
        );
    }

    // ₹1 payment - Show gossips list with share button
    return (
        <GossipsListAfterPayment paymentId={verifiedPaymentId} rank={rank} />
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center bg-black text-white">
                <h1>Loading…</h1>
            </main>
        }>
            <SuccessContent />
        </Suspense>
    );
}