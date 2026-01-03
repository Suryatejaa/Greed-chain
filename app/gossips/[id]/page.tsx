"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import CashfreeButton2 from "../../components/CashfreeButton2";

interface Sentence {
  id: string;
  text: string;
  rank: number;
}

interface Gossip {
  id: string;
  title: string;
  creatorRank: number;
  sentences: Sentence[];
}

function GossipContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;
  const paymentId = searchParams.get("payment_id");
  const [gossip, setGossip] = useState<Gossip | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verifying, setVerifying] = useState(!!paymentId);

  useEffect(() => {
    // Verify payment first
    if (paymentId) {
      fetch(`/api/check-payment?payment_id=${paymentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.exists && data.amount === 1) {
            setPaymentVerified(true);
          } else {
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
    if (!id || !paymentVerified) return;

    fetch(`/api/gossips/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setGossip(null);
        } else {
          setGossip(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setGossip(null);
        setLoading(false);
      });
  }, [id, paymentVerified]);

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

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-center opacity-60">Loading...</p>
        </div>
      </main>
    );
  }

  if (!gossip) {
    return (
      <main className="min-h-screen bg-black text-white p-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl mb-4">Gossip not found</h1>
          <Link href="/gossips" className="text-blue-400 underline">
            Back to gossips
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/gossips"
            className="text-blue-400 underline text-sm mb-4 inline-block"
          >
            ← Back to gossips
          </Link>
          <h1 className="text-3xl font-bold mb-2">{gossip.title}</h1>
          <p className="text-sm opacity-60">
            Origin: #{gossip.creatorRank} • {gossip.sentences.length} sentence{gossip.sentences.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {gossip.sentences.map((sentence) => (
            <div
              key={sentence.id}
              className="border-l-2 border-white/20 pl-4 py-2"
            >
              <span className="text-xs opacity-40 mr-3">#{sentence.rank}</span>
              <span className="text-lg">{sentence.text}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-white/20 pt-6 space-y-4">
          <div className="flex flex-col items-center">
            <p className="text-sm opacity-70 mb-3">₹2 - Create a new gossip</p>
            <CashfreeButton2 />
          </div>

          <div>
            <p className="text-sm opacity-60 mb-4">
              This gossip is being written one sentence at a time.
              You can read it.
              You can only add once.
              ₹1.
            </p>
            <button
              onClick={() => {
                navigator.share?.({
                  title: gossip.title,
                  text: `Read this gossip on GreedChain: ${gossip.title}`,
                  url: window.location.href,
                }) || navigator.clipboard.writeText(window.location.href);
              }}
              className="bg-white text-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Share Gossip
            </button>
          </div>

          {paymentId && (
            <Link
              href={`/add-sentence?payment_id=${paymentId}&gossip_id=${id}`}
              className="block bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-white/20 transition-colors text-center"
            >
              Add Your Sentence
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

export default function GossipPage() {
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
      <GossipContent />
    </Suspense>
  );
}

