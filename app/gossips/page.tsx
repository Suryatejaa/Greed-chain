"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import CashfreeButton2 from "../components/CashfreeButton2";

interface Gossip {
  id: string;
  title: string;
  creatorRank: number;
  sentenceCount: number;
}

function GossipsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const paymentId = params.get("payment_id");
  const [gossips, setGossips] = useState<Gossip[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verifying, setVerifying] = useState(!!paymentId);

  useEffect(() => {
    // If payment_id is provided, verify it first
    if (paymentId) {
      fetch(`/api/check-payment?payment_id=${paymentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.exists && data.amount === 1) {
            setPaymentVerified(true);
          } else {
            // Invalid payment, redirect to home
            router.push("/");
          }
          setVerifying(false);
        })
        .catch(() => {
          setVerifying(false);
          router.push("/");
        });
    } else {
      // No payment, redirect to home
      router.push("/");
    }
  }, [paymentId, router]);

  useEffect(() => {
    if (paymentVerified) {
      fetch("/api/gossips")
        .then((res) => res.json())
        .then((data) => {
          setGossips(data.gossips || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [paymentVerified]);

  if (verifying) {
    return (
      <main className="min-h-screen bg-black text-white p-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-center opacity-60">Verifying access...</p>
        </div>
      </main>
    );
  }

  if (!paymentVerified) {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Gossips</h1>
          <Link
            href="/"
            className="text-blue-400 underline text-sm"
          >
            Home
          </Link>
        </div>

        <div className="mb-8 p-4 border border-white/20 rounded-lg flex flex-col items-center">
          <p className="text-sm opacity-70 mb-3">₹2 - Create a new gossip</p>
          <CashfreeButton2 />
        </div>

        {loading ? (
          <p className="text-center opacity-60">Loading gossips...</p>
        ) : gossips.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl mb-4 opacity-60">No gossips yet.</p>
            <p className="text-sm opacity-40">
              Use the button above to start the first one.
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
                <h2 className="text-xl font-semibold mb-2">{gossip.title}</h2>
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

export default function GossipsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white p-4">
          <div className="max-w-2xl mx-auto">
            <p className="text-center opacity-60">Loading...</p>
          </div>
        </main>
      }
    >
      <GossipsContent />
    </Suspense>
  );
}

