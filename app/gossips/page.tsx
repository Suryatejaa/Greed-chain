"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Gossip {
  id: string;
  title: string;
  creatorRank: number;
  sentenceCount: number;
}

export default function GossipsPage() {
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

        {loading ? (
          <p className="text-center opacity-60">Loading gossips...</p>
        ) : gossips.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl mb-4 opacity-60">No gossips yet.</p>
            <p className="text-sm opacity-40">
              Pay ₹2 to start the first one.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {gossips.map((gossip) => (
              <Link
                key={gossip.id}
                href={`/gossips/${gossip.id}`}
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

