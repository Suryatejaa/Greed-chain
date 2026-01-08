"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

type Stats = {
  count1: number;
  count5: number;
  count11: number;
  totalAmount: number;
};

function SuccessContent() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [prevStats, setPrevStats] = useState<Stats | null>(null);
  const [visibleAmount, setVisibleAmount] = useState<1 | 5 | 11 | null>(null);

  /**
   * Poll stats (webhook-driven truth)
   */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/stats?t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        setStats(data);
      } catch {}
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Detect delta → unlock exactly ONE amount
   */
  useEffect(() => {
    if (!stats) return;

    // first snapshot
    if (!prevStats) {
      setPrevStats(stats);
      return;
    }

    if (stats.count1 > prevStats.count1) setVisibleAmount(1);
    if (stats.count5 > prevStats.count5) setVisibleAmount(5);
    if (stats.count11 > prevStats.count11) setVisibleAmount(11);

    setPrevStats(stats);
  }, [stats, prevStats]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-6">Payment Received ✅</h1>

        {/* ---- Payment Count Reveal ---- */}
        {stats && visibleAmount && (
          <div className="border border-white/20 rounded-lg p-4 mb-4">
            <p className="text-sm opacity-60 mb-3">You unlocked</p>

            {visibleAmount === 1 && (
              <div className="flex justify-between">
                <span>₹1 payments</span>
                <span className="font-semibold">{stats.count1}</span>
              </div>
            )}

            {visibleAmount === 5 && (
              <div className="flex justify-between">
                <span>₹5 payments</span>
                <span className="font-semibold">{stats.count5}</span>
              </div>
            )}

            {visibleAmount === 11 && (
              <div className="flex justify-between">
                <span>₹11 payments</span>
                <span className="font-semibold">{stats.count11}</span>
              </div>
            )}
          </div>
        )}

        {/* ---- Waiting state ---- */}
        {!visibleAmount && (
          <p className="text-xs opacity-40 my-6">
            Waiting for payment confirmation…
          </p>
        )}

        {/* ---- Total is always public ---- */}
        {stats && (
          <div className="border border-white/20 rounded-lg p-4 mb-6">
            <p className="text-sm opacity-60 mb-2">Total Collected</p>
            <p className="text-2xl font-bold">₹{stats.totalAmount}</p>
          </div>
        )}

        <p className="text-xs opacity-40 mb-6">
          This experiment only reveals what your payment unlocked.
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
