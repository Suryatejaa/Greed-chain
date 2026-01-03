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

function StoriesListAfterPayment({ paymentId, rank }: { paymentId: string; rank: number }) {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/stories")
            .then((res) => res.json())
            .then((data) => {
                setStories(data.stories || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleShare = () => {
        const shareText = `I'm ranked #${rank} on GreedChain. Join the narrative.`;
        const shareUrl = window.location.origin;

        navigator.share?.({
            title: "GreedChain",
            text: shareText,
            url: shareUrl,
        }) || navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    };

    return (
        <main className="min-h-screen bg-black text-white p-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Access Granted</h1>
                    <p className="mb-4 opacity-80">
                        You&apos;re in. Rank #{rank}
                    </p>
                    <p className="text-sm opacity-60 mb-6">
                        Add one sentence to any story. 150 characters max. Permanent.
                    </p>
                    <button
                        onClick={handleShare}
                        className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Share Access
                    </button>
                </div>

                <h2 className="text-2xl font-bold mb-6">Stories</h2>

                <div className="mb-6 flex flex-col items-center">
                    <p className="text-sm opacity-70 mb-3">Start Your Own Story</p>
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
                                <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
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

function SuccessContent() {
    const params = useSearchParams();
    const router = useRouter();
    // Razorpay returns payment_id in URL params
    const paymentId = params.get("payment_id");
    const [status, setStatus] = useState("verifying");
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!paymentId) {
            setError("Missing payment ID. Please try again or contact support.");
            setStatus("failed");
            return;
        }

        // Verify payment with Razorpay
        fetch(`/api/verify-payment?payment_id=${paymentId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Store payment_id in localStorage for permanent read-only access
                    localStorage.setItem("razorpay_payment_id", paymentId);
                    localStorage.setItem("razorpay_payment_amount", data.amount.toString());
                    localStorage.setItem("razorpay_payment_rank", data.rank.toString());
                    
                    // If ₹2, ₹5, or ₹11 payment, redirect to /create-story (they can create stories)
                    if (data.amount === 2 || data.amount === 5 || data.amount === 11) {
                        router.push("/create-story");
                        return;
                    }
                    
                    setStatus("success");
                    setData(data);
                } else {
                    setError(data.error || "Payment verification failed. Please ensure the payment was successful.");
                    setStatus("failed");
                }
            })
            .catch(err => {
                console.error("Payment verification error:", err);
                setError("Failed to verify payment. Please try again or contact support.");
                setStatus("failed");
            });
    }, [paymentId, router]);

    if (status === "verifying") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-black text-white">
                <h1>Verifying your payment…</h1>
            </main>
        );
    }

    if (status === "failed") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center max-w-md px-4">
                    <h1 className="text-2xl mb-4">Payment verification failed ❌</h1>
                    {error && (
                        <p className="text-sm opacity-60 mb-4">{error}</p>
                    )}
                    <Link href="/" className="text-blue-400 underline">
                        Go back
                    </Link>
                </div>
            </main>
        );
    }

    const paymentAmount = data?.amount || 0;
    const rank = data?.rank || 0;
    const verifiedPaymentId = data?.paymentId || paymentId;

    // ₹2, ₹5, or ₹11 payment - Show create story option
    if (paymentAmount === 2 || paymentAmount === 5 || paymentAmount === 11) {
        const maxStories = paymentAmount === 2 ? 1 : paymentAmount === 5 ? 1 : 3;
        const maxSentences = paymentAmount === 2 ? 0 : paymentAmount === 5 ? 3 : 5;
        return (
            <main className="min-h-screen flex items-center justify-center bg-black text-white p-4">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-3xl font-bold mb-6">Start a Story</h1>
                    <p className="mb-4 opacity-80">
                        Creator access. Rank #{rank}
                    </p>
                    <p className="mb-8 text-sm opacity-60">
                        {paymentAmount === 2 ? "One story. One chance. Make it count." : 
                         paymentAmount === 5 ? `Create ${maxStories} story, add ${maxSentences} sentences.` :
                         `Create ${maxStories} stories, add ${maxSentences} sentences.`}
                    </p>
                    <Link
                        href={`/create-story`}
                        className="block bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Create Story
                    </Link>
                    <Link
                        href={`/stories`}
                        className="block mt-4 text-blue-400 underline text-sm"
                    >
                        Back to stories
                    </Link>
                </div>
            </main>
        );
    }

    // ₹1 payment - Show stories list with share button
    return (
        <StoriesListAfterPayment paymentId={verifiedPaymentId} rank={rank} />
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center bg-black text-white">
                <h1>Loading…</h1>
            </main>
        }>
            <SuccessContent />
        </Suspense>
    );
}