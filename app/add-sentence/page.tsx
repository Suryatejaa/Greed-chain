"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Gossip {
  id: string;
  title: string;
}

function AddSentenceContent() {
  const params = useSearchParams();
  const router = useRouter();
  const paymentId = params.get("payment_id");
  const [gossips, setGossips] = useState<Gossip[]>([]);
  const [selectedGossipId, setSelectedGossipId] = useState("");
  const [sentence, setSentence] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gossipsLoading, setGossipsLoading] = useState(true);

  useEffect(() => {
    if (!paymentId) {
      router.push("/");
      return;
    }

    // Check if payment is valid and unused
    fetch(`/api/check-payment?payment_id=${paymentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.exists || data.used || data.amount !== 1) {
          router.push("/");
        }
      });

    // Load gossips
    fetch("/api/gossips")
      .then((res) => res.json())
      .then((data) => {
        setGossips(data.gossips || []);
        setGossipsLoading(false);
      })
      .catch(() => setGossipsLoading(false));
  }, [paymentId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentId || !selectedGossipId) return;

    if (sentence.trim().length === 0) {
      setError("Sentence is required");
      return;
    }

    if (sentence.length > 30) {
      setError("Sentence must be 30 characters or less");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/gossips/${selectedGossipId}/add-sentence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          text: sentence.trim(),
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
      } else {
        router.push(`/gossips/${selectedGossipId}`);
      }
    } catch (err) {
      setError("Failed to add sentence. Please try again.");
      setLoading(false);
    }
  };

  if (!paymentId) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add a Sentence</h1>

        <p className="text-sm opacity-60 mb-6">
          You can add ONE sentence total. Choose your gossip carefully.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm opacity-80 mb-2">
              Select Gossip
            </label>
            {gossipsLoading ? (
              <p className="text-sm opacity-60">Loading gossips...</p>
            ) : gossips.length === 0 ? (
              <p className="text-sm opacity-60">
                No gossips available. Create one first.
              </p>
            ) : (
              <div className="space-y-2">
                {gossips.map((gossip) => (
                  <label
                    key={gossip.id}
                    className="flex items-center space-x-3 p-3 border border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors"
                  >
                    <input
                      type="radio"
                      name="gossip"
                      value={gossip.id}
                      checked={selectedGossipId === gossip.id}
                      onChange={(e) => setSelectedGossipId(e.target.value)}
                      className="w-4 h-4"
                      required
                    />
                    <span>{gossip.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm opacity-80 mb-2">
              Your Sentence (max 30 characters)
            </label>
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40 h-24 resize-none"
              placeholder="Write your sentence..."
              maxLength={30}
              required
            />
            <p className="text-xs opacity-60 mt-1 text-right">
              {sentence.length}/30
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedGossipId}
            className="w-full bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Sentence"}
          </button>
        </form>

        <p className="text-xs opacity-40 mt-6 text-center">
          No edits after submission. No refunds.
        </p>
      </div>
    </main>
  );
}

export default function AddSentencePage() {
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
      <AddSentenceContent />
    </Suspense>
  );
}

