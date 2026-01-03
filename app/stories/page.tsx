"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import RazorpayButton2 from "../components/RazorpayButton2";

interface Story {
  id: string;
  title: string;
  creatorRank: number;
  sentenceCount: number;
}

function StoriesContent() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Check sessionStorage for payment_id
    const paymentId = sessionStorage.getItem("razorpay_payment_id");
    
    if (!paymentId) {
      // No payment in session, redirect to home
      router.push("/");
      return;
    }

    // Verify payment is valid (allow both ₹1 and ₹2 payments, even if used)
    fetch(`/api/check-payment?payment_id=${paymentId}`)
      .then((res) => res.json())
      .then((data) => {
        // Allow access if payment exists and is ₹1 or ₹2 (regardless of used status)
        // Used payments still grant read access
        if (data.exists && (data.amount === 1 || data.amount === 2)) {
          setPaymentVerified(true);
        } else if (data.error) {
          // API error, don't clear sessionStorage yet, just redirect
          console.error("Payment check error:", data.error);
          router.push("/");
        } else {
          // Payment doesn't exist or invalid amount, clear session and redirect
          sessionStorage.removeItem("razorpay_payment_id");
          sessionStorage.removeItem("razorpay_payment_amount");
          sessionStorage.removeItem("razorpay_payment_rank");
          router.push("/");
        }
        setVerifying(false);
      })
      .catch((err) => {
        console.error("Error checking payment:", err);
        // Network error - don't clear sessionStorage, just redirect
        // SessionStorage might still be valid, let user try again
        router.push("/");
        setVerifying(false);
      });
  }, [router]);

  useEffect(() => {
    if (paymentVerified) {
      fetch("/api/stories")
        .then((res) => res.json())
        .then((data) => {
          setStories(data.stories || []);
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
          <h1 className="text-3xl font-bold">Stories</h1>
          <Link
            href="/"
            className="text-blue-400 underline text-sm"
          >
            Home
          </Link>
        </div>

        <div className="mb-8 p-4 border border-white/20 rounded-lg flex flex-col items-center">
          <p className="text-sm opacity-70 mb-3">₹2 - Create a new story</p>
          <RazorpayButton2 />
        </div>

        {loading ? (
          <p className="text-center opacity-60">Loading stories...</p>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl mb-4 opacity-60">No stories yet.</p>
            <p className="text-sm opacity-40">
              Use the button above to start the first one.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="block border border-white/20 rounded-lg p-4 hover:border-white/40 transition-colors"
              >
                <h2 className="text-xl font-semibold mb-2">{story.title}</h2>
                <div className="flex items-center gap-4 text-sm opacity-60">
                  <span>#{story.creatorRank} origin</span>
                  <span>{story.sentenceCount} sentence{story.sentenceCount !== 1 ? 's' : ''}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function StoriesPage() {
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
      <StoriesContent />
    </Suspense>
  );
}

