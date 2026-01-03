"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import RazorpayButton2 from "../../components/RazorpayButton2";
import RazorpayButton from "@/app/components/RazorpayButton";

interface Sentence {
  id: string;
  text: string;
  rank: number;
}

interface Story {
  id: string;
  title: string;
  creatorRank: number;
  sentences: Sentence[];
}

function StoryContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [paymentUsed, setPaymentUsed] = useState<boolean>(false);
  const [sentencesUsed, setSentencesUsed] = useState<number>(0);
  const [maxSentences, setMaxSentences] = useState<number>(0);

  useEffect(() => {
    // Check localStorage for payment_id
    const storedPaymentId = localStorage.getItem("razorpay_payment_id");
    
    if (!storedPaymentId) {
      // No payment in localStorage, redirect to home
      router.push("/");
      return;
    }

    setPaymentId(storedPaymentId);

    // Get user's rank from localStorage
    const storedRank = localStorage.getItem("razorpay_payment_rank");
    if (storedRank) {
      setUserRank(parseInt(storedRank, 10));
    }

    // Verify payment is valid
    fetch(`/api/check-payment?payment_id=${storedPaymentId}`)
      .then((res) => res.json())
      .then((data) => {
        // Allow access if payment exists and is ₹1, ₹5, ₹11, or ₹2 (regardless of used status)
        // Used payments still grant read access
        if (data.exists && (data.amount === 1 || data.amount === 5 || data.amount === 11 || data.amount === 2)) {
          setPaymentVerified(true);
          setPaymentAmount(data.amount);
          setPaymentUsed(data.used || false);
          setSentencesUsed(data.sentencesUsed || 0);
          setMaxSentences(data.maxSentences || 0);
          // Also set rank from API response if not in localStorage
          if (!storedRank && data.rank) {
            setUserRank(data.rank);
          }
        } else if (data.error) {
          // API error, don't clear localStorage yet, just redirect
          console.error("Payment check error:", data.error);
          router.push("/");
        } else {
          // Payment doesn't exist or invalid amount, clear localStorage and redirect
          localStorage.removeItem("razorpay_payment_id");
          localStorage.removeItem("razorpay_payment_amount");
          localStorage.removeItem("razorpay_payment_rank");
          router.push("/");
        }
        setVerifying(false);
      })
      .catch((err) => {
        console.error("Error checking payment:", err);
        // Network error - don't clear localStorage, just redirect
        // localStorage might still be valid, let user try again
        router.push("/");
        setVerifying(false);
      });
  }, [router]);

  useEffect(() => {
    if (!id || !paymentVerified) return;

    fetch(`/api/stories/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStory(null);
        } else {
          setStory(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setStory(null);
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

  if (!story) {
    return (
      <main className="min-h-screen bg-black text-white p-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl mb-4">Story not found</h1>
          <Link href="/stories" className="text-blue-400 underline">
            Back to stories
          </Link>
        </div>
      </main>
    );
  }

  // Sort sentences by rank (ascending - first come first, latest at bottom)
  const sortedSentences = [...story.sentences].sort((a, b) => a.rank - b.rank);

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Link
            href="/stories"
            className="text-blue-400 underline text-sm mb-4 inline-block"
          >
            ← Back to stories
          </Link>
          <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
          <p className="text-sm opacity-60">
            Origin: #{story.creatorRank} • {story.sentences.length} sentence{story.sentences.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="max-h-[60vh] overflow-y-auto mb-6 pr-2">
          <div className="space-y-3">
            {sortedSentences.map((sentence) => (
              <div
                key={sentence.id}
                className="border-l-2 border-white/20 pl-4 py-2"
              >
                <span className="text-xs opacity-40 mr-3">#{sentence.rank}</span>
                <span className="text-lg">{sentence.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 space-y-4">
          <div className="flex flex-col items-center">
            <p className="text-sm opacity-70 mb-3">Start Your Own Story</p>
            <RazorpayButton2 />
          </div>

          <div>
            <p className="text-sm opacity-60 mb-4">
              This story is being written one sentence at a time.
              Read it. Contribute once. It&apos;s permanent.
            </p>
            <button
              onClick={() => {
                navigator.share?.({
                  title: story.title,
                  text: `Read this story on GreedChain: ${story.title}`,
                  url: window.location.href,
                }) || navigator.clipboard.writeText(window.location.href);
              }}
              className="bg-white text-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Share Story
            </button>
          </div>

          {paymentId && (paymentAmount === 1 || paymentAmount === 5 || paymentAmount === 11) && userRank !== null && !story.sentences.some(s => s.rank === userRank) && sentencesUsed < maxSentences ? (
            <Link
              href={`/add-sentence?story_id=${id}`}
              className="block bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-white/20 transition-colors text-center"
            >
              Add Your Sentence {maxSentences > 1 ? `(${maxSentences - sentencesUsed} remaining)` : ''}
            </Link>
          ) : (paymentAmount === 1 || paymentAmount === 5 || paymentAmount === 11) && sentencesUsed >= maxSentences ? (
            <>
            <p className="text-sm opacity-60 mb-4">
              You&apos;ve used all your sentences ({sentencesUsed}/{maxSentences}). Get access again to add more.
            </p>
            <RazorpayButton paymentButtonId="pl_Rz65r6ImL0PS8U" formId="razorpay-form-story-1" />
            </> 
          ) : paymentAmount === 2 ? (
            <>
            <p className="text-sm opacity-60 mb-4">
              You have creator access. Get contributor access to add sentences.
            </p>
            <RazorpayButton paymentButtonId="pl_Rz65r6ImL0PS8U" formId="razorpay-form-story-2" />
            </> 
          ) : null
          }
        </div>
      </div>
    </main>
  );
}

export default function StoryPage() {
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
      <StoryContent />
    </Suspense>
  );
}

