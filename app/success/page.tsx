"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

/* ---------------- Types ---------------- */

type Stats = {
  count1: number;
  count5: number;
  count11: number;
  totalAmount: number;
};

type Amount = 1 | 5 | 11;

/* ---------------- Secret code map ---------------- */
/**
 * Obfuscated on purpose.
 * Not security — just confusion.
 */
const AMOUNT_CODE_MAP: Record<string, Amount> = {
  a9xQ: 1,
  Kp2Z: 5,
  "7LmR": 11,
};

/* ---------------- Page ---------------- */
function SkeletonRow() {
  return (
    <div className="flex justify-between items-center animate-pulse">
      <div className="h-4 w-32 bg-white/10 rounded" />
      <div className="h-4 w-10 bg-white/10 rounded" />
    </div>
  );
}
function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 500; // ms
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const current = Math.floor(progress * value);
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [value]);

  return <span className="font-semibold">{display}</span>;
}

function SuccessContent() {
  const params = useSearchParams();
  const code = params.get("k");

  const visibleAmount: Amount | null =
    code && AMOUNT_CODE_MAP[code] ? AMOUNT_CODE_MAP[code] : null;

  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  /* ---- Poll stats (webhook-driven truth) ---- */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/stats?t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        setStats(data);
        setLoadingStats(false);
      } catch { }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  /* ---------------- UI ---------------- */

  return (
    <main className="relative z-10 min-h-screen flex items-center justify-center bg-black/30 backdrop-blur-lg border border-white/20 text-white p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-6">Payment Received ✅</h1>

        {/* ---- Unlock section ---- */}
        {stats && visibleAmount && (
          <div className="border border-white/20 rounded-lg p-4 mb-4">
            <p className="text-sm opacity-60 mb-3">You unlocked</p>

            {loadingStats && <SkeletonRow />}

            {!loadingStats && stats && visibleAmount === 1 && (
              <div className="flex justify-between animate-[fadeIn_0.4s_ease-out]">
                <span>₹1 payments</span>
                <CountUp value={stats.count1} />
              </div>
            )}

            {!loadingStats && stats && visibleAmount === 5 && (
              <div className="flex justify-between animate-[fadeIn_0.4s_ease-out]">
                <span>₹5 payments</span>
                <CountUp value={stats.count5} />
              </div>
            )}

            {!loadingStats && stats && visibleAmount === 11 && (
              <div className="flex justify-between animate-[fadeIn_0.4s_ease-out]">
                <span>₹11 payments</span>
                <CountUp value={stats.count11} />
              </div>
            )}
          </div>

        )}

        {/* ---- No / invalid code ---- */}
        {!visibleAmount && (
          <p className="text-xs opacity-40 my-6">
            Payment recorded. Thanks for participating.
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
        {/* ---- Share button ---- */}
        <button
          onClick={() => {
            navigator.share({
              title: "GreedChain",
              text: "Check out this social experiment!",
              url: window.location.href,
            });
          }}
          className="block bg-white text-black px-6 py-3 w-full rounded-xl font-semibold mt-4"
        >
          Share with friends
        </button>
      </div>
    </main>
  );
}

/* ---------------- Suspense wrapper ---------------- */

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
