"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const params = useSearchParams();
  const rawPaymentId = params.get("payment_id");

  const isRazorpayPayment =
    rawPaymentId &&
    rawPaymentId !== "{payment_id}" &&
    rawPaymentId.startsWith("pay_");

  const paymentId = isRazorpayPayment ? rawPaymentId : null;


  const [status, setStatus] = useState<"verifying" | "success" | "failed">(
    paymentId ? "verifying" : "success"
  );
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * ✅ Razorpay verification
   */
  useEffect(() => {
    if (!paymentId) return;

    fetch(`/api/verify-payment?payment_id=${paymentId}`, {
      cache: "no-store",
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result);
          setStatus("success");
        } else {
          setError(result.error || "Payment verification failed");
          setStatus("failed");
        }
      })
      .catch(() => {
        setError("Failed to verify payment");
        setStatus("failed");
      });
  }, [paymentId]);

  /**
   * ✅ Stats polling (works for BOTH Razorpay & Cashfree)
   */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/stats?t=${Date.now()}`, { cache: "no-store" });
        const statsData = await res.json();
        setStats(statsData);
      } catch { }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  // ---------------- UI ----------------

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
          <h1 className="text-2xl mb-4">Payment failed ❌</h1>
          {error && <p className="text-sm opacity-60 mb-4">{error}</p>}
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
        <h1 className="text-3xl font-bold mb-6">Payment Received ✅</h1>

        {data?.amount && (
          <div className="border border-white/20 rounded-lg p-4 mb-6">
            <p className="text-sm opacity-60 mb-2">You paid</p>
            <p className="text-2xl font-bold">₹{data.amount}</p>
          </div>
        )}

        {stats && (
          <>
            <div className="border border-white/20 rounded-lg p-4 mb-4">
              <p className="text-sm opacity-60 mb-3">Payment Counts</p>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span>₹1 payments</span>
                  {/* <span>{data?.amount === 1 ? stats.count1 : '***'}</span>
                   */}
                  <span>
                    {paymentId
                      ? (data?.amount === 1 ? stats.count1 : "***")
                      : stats.count1}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>₹5 payments</span>
                  {/* <span>{data?.amount === 5 ? stats.count5 : '***'}</span> */}
                  <span>
                    {paymentId
                      ? (data?.amount === 5 ? stats.count5 : "***")
                      : stats.count5}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>₹11 payments</span>
                  {/* <span>{data?.amount === 11 ? stats.count11 : '***'}</span> */}
                  <span>
                    {paymentId
                      ? (data?.amount === 11 ? stats.count11 : "***")
                      : stats.count11}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-white/20 rounded-lg p-4">
              <p className="text-sm opacity-60 mb-2">Total Collected</p>
              <p className="text-2xl font-bold">₹{stats.totalAmount}</p>
            </div>
          </>
        )}

        <p className="text-xs opacity-40 my-6">
          Cashfree payments may take a few seconds to reflect.
        </p>

        <Link
          href="/"
          className="block bg-white text-black px-6 py-3 rounded-xl font-semibold"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-black text-white">
          <h1>Loading…</h1>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
