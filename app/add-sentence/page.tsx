"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Story {
  id: string;
  title: string;
}

function AddSentenceContent() {
  const params = useSearchParams();
  const router = useRouter();
  const preSelectedStoryId = params.get("story_id");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState(preSelectedStoryId || "");
  const [sentence, setSentence] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Check localStorage for payment_id
    const storedPaymentId = localStorage.getItem("razorpay_payment_id");
    
    if (!storedPaymentId) {
      router.push("/");
      return;
    }

    setPaymentId(storedPaymentId);

    // Check if payment is valid and unused
    fetch(`/api/check-payment?payment_id=${storedPaymentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.exists || (data.amount !== 1 && data.amount !== 5 && data.amount !== 11)) {
          // Invalid payment or wrong amount (must be ₹1, ₹5, or ₹11 for adding sentences)
          router.push("/stories");
        } else if (data.sentencesUsed >= (data.maxSentences || 0)) {
          // Sentence limit reached
          router.push("/stories");
        } else {
          // Payment is valid and unused
          setVerifying(false);
        }
      })
      .catch(() => {
        // Network error - redirect to stories
        router.push("/stories");
      });

    // Load stories
    fetch("/api/stories")
      .then((res) => res.json())
      .then((data) => {
        setStories(data.stories || []);
        setStoriesLoading(false);
      })
      .catch(() => setStoriesLoading(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentId || !selectedStoryId) return;

    if (sentence.trim().length === 0) {
      setError("Sentence is required");
      return;
    }

    if (sentence.length > 150) {
      setError("Sentence must be 150 characters or less");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/stories/${selectedStoryId}/add-sentence`, {
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
        router.push(`/stories/${selectedStoryId}`);
      }
    } catch (err) {
      setError("Failed to add sentence. Please try again.");
      setLoading(false);
    }
  };

  if (verifying || !paymentId) {
    return (
      <main className="min-h-screen bg-black text-white p-4">
        <div className="max-w-md mx-auto">
          <p className="text-center opacity-60">Verifying access...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Contribute</h1>

        <p className="text-sm opacity-60 mb-6">
          One sentence. One story. Permanent.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm opacity-80 mb-2">
              Select Story
            </label>
            {storiesLoading ? (
              <p className="text-sm opacity-60">Loading stories...</p>
            ) : stories.length === 0 ? (
              <p className="text-sm opacity-60">
                No stories available. Create one first.
              </p>
            ) : (
              <div className="space-y-2">
                {stories.map((story) => (
                  <label
                    key={story.id}
                    className="flex items-center space-x-3 p-3 border border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors"
                  >
                    <input
                      type="radio"
                      name="story"
                      value={story.id}
                      checked={selectedStoryId === story.id}
                      onChange={(e) => setSelectedStoryId(e.target.value)}
                      className="w-4 h-4"
                      required
                    />
                    <span>{story.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm opacity-80 mb-2">
              Your Sentence (max 150 characters)
            </label>
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40 h-24 resize-none"
              placeholder="Write your sentence..."
              maxLength={150}
              required
            />
            <p className="text-xs opacity-60 mt-1 text-right">
              {sentence.length}/150
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedStoryId}
            className="w-full bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Sentence"}
          </button>
        </form>

        <p className="text-xs opacity-40 mt-6 text-center">
          Permanent. No edits. No refunds.
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

