"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function CreateGossipContent() {
  const params = useSearchParams();
  const router = useRouter();
  const paymentId = params.get("payment_id");
  const [title, setTitle] = useState("");
  const [firstSentence, setFirstSentence] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!paymentId) {
      router.push("/");
      return;
    }

    // Check if payment is valid and unused
    fetch(`/api/check-payment?payment_id=${paymentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.exists || data.used || data.amount !== 2) {
          router.push("/");
        }
      });
  }, [paymentId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentId) return;

    if (title.trim().length === 0) {
      setError("Title is required");
      return;
    }

    if (firstSentence.trim().length === 0) {
      setError("First sentence is required");
      return;
    }

    if (firstSentence.length > 30) {
      setError("Sentence must be 30 characters or less");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/gossips/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          title: title.trim(),
          firstSentence: firstSentence.trim(),
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
      } else {
        router.push(`/gossips/${data.gossipId}`);
      }
    } catch (err) {
      setError("Failed to create gossip. Please try again.");
      setLoading(false);
    }
  };

  if (!paymentId) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Start a Gossip</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm opacity-80 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40"
              placeholder="Give your gossip a title..."
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm opacity-80 mb-2">
              First Sentence (max 30 characters)
            </label>
            <textarea
              value={firstSentence}
              onChange={(e) => setFirstSentence(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40 h-24 resize-none"
              placeholder="Write the first sentence..."
              maxLength={30}
              required
            />
            <p className="text-xs opacity-60 mt-1 text-right">
              {firstSentence.length}/30
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Gossip"}
          </button>
        </form>

        <p className="text-xs opacity-40 mt-6 text-center">
          No edits after submission. Choose carefully.
        </p>
      </div>
    </main>
  );
}

export default function CreateGossipPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white p-4">
          <div className="max-w-md mx-auto">
            <p className="text-center opacity-60">Loading...</p>
          </div>
        </main>
      }
    >
      <CreateGossipContent />
    </Suspense>
  );
}

