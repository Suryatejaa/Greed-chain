"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const params = useSearchParams();
  const paymentId = params.get("payment_id");
  const [status, setStatus] = useState("verifying");
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setError("Missing payment ID. Please try again or contact support.");
      setStatus("failed");
      return;
    }

    // Verify payment with Razorpay
    fetch(`/api/verify-payment?payment_id=${paymentId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus("success");
          setData(data);
          
          // Fetch stats
          fetch("/api/stats")
            .then(res => res.json())
            .then(statsData => {
              setStats(statsData);
            })
            .catch(() => {
              // Stats fetch failed, but payment is verified
            });
        } else {
          setError(data.error || "Payment verification failed. Please ensure the payment was successful.");
          setStatus("failed");
        }
      })
      .catch(err => {
        console.error("Payment verification error:", err);
        setError("Failed to verify payment. Please try again or contact support.");
        setStatus("failed");
      });
  }, [paymentId]);

  useEffect(() => {
    // Refresh stats every 2 seconds
    const interval = setInterval(() => {
      fetch("/api/stats")
        .then(res => res.json())
        .then(statsData => {
          setStats(statsData);
        })
        .catch(() => {});
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-6">Payment Successful</h1>
        
        <div className="mb-8 space-y-4">
          <div className="border border-white/20 rounded-lg p-4">
            <p className="text-sm opacity-60 mb-2">You paid</p>
            <p className="text-2xl font-bold">₹{data?.amount || 0}</p>
          </div>

          {stats && (
            <>
              <div className="border border-white/20 rounded-lg p-4">
                <p className="text-sm opacity-60 mb-3">Payment Counts</p>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="opacity-80">₹1 payments:</span>
                    <span className="font-semibold">{stats.count1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">₹5 payments:</span>
                    <span className="font-semibold">{stats.count5}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">₹11 payments:</span>
                    <span className="font-semibold">{stats.count11}</span>
                  </div>
                </div>
              </div>

              <div className="border border-white/20 rounded-lg p-4">
                <p className="text-sm opacity-60 mb-2">Total Amount Collected</p>
                <p className="text-2xl font-bold">₹{stats.totalAmount}</p>
              </div>
            </>
          )}
        </div>

        <p className="text-xs opacity-40 mb-6">
          This is a social experiment. You don&apos;t really need to see if you don&apos;t want to. Just ignore it. Don&apos;t spread nonsense.
        </p>

        <Link
          href="/"
          className="block bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </main>
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
