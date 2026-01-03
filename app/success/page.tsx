"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
    const params = useSearchParams();
    const router = useRouter();
    // Cashfree returns order_id in the callback URL
    const orderId = params.get("order_id");
    const paymentId = params.get("payment_id"); // Cashfree may also return this
    const amountParam = params.get("amount"); // Amount from URL (1 or 2)
    const [status, setStatus] = useState("verifying");
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        // Cashfree typically returns order_id
        const identifier = orderId || paymentId;
        
        if (!identifier) {
            setError("Missing payment information");
            setStatus("failed");
            return;
        }

        // Build query string for Cashfree verification
        const queryParams = new URLSearchParams();
        if (orderId) queryParams.append("order_id", orderId);
        if (paymentId) queryParams.append("payment_id", paymentId);
        if (amountParam) queryParams.append("amount", amountParam);

        fetch(`/api/verify-payment-cashfree?${queryParams.toString()}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus("success");
                    setData(data);
                } else {
                    setError(data.error || "Payment verification failed");
                    setStatus("failed");
                }
            })
            .catch(err => {
                console.error("Payment verification error:", err);
                setError("Failed to verify payment");
                setStatus("failed");
            });
    }, [orderId, paymentId, amountParam]);

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

    // ₹2 payment - Show create gossip option
    if (paymentAmount === 2) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-black text-white p-4">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-3xl font-bold mb-6">Start a Gossip</h1>
                    <p className="mb-4 opacity-80">
                        You paid ₹2. Rank #{rank}
                    </p>
                    <p className="mb-8 text-sm opacity-60">
                        You can create ONE gossip. Choose your words carefully.
                    </p>
                    <Link
                        href={`/create-gossip?payment_id=${data?.paymentId || orderId || paymentId}`}
                        className="block bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Create Gossip
                    </Link>
                    <Link
                        href="/gossips"
                        className="block mt-4 text-blue-400 underline text-sm"
                    >
                        Browse existing gossips
                    </Link>
                </div>
            </main>
        );
    }

    // ₹1 payment - Show add sentence option
    return (
        <main className="min-h-screen flex items-center justify-center bg-black text-white p-4">
            <div className="max-w-md w-full text-center">
                <h1 className="text-3xl font-bold mb-6">Add a Sentence</h1>
                <p className="mb-4 opacity-80">
                    You paid ₹1. Rank #{rank}
                </p>
                <p className="mb-8 text-sm opacity-60">
                    You can add ONE sentence to any gossip. Max 30 characters. No edits.
                </p>
                <Link
                    href={`/add-sentence?payment_id=${data?.paymentId || orderId || paymentId}`}
                    className="block bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                    Add Sentence
                </Link>
                <Link
                    href="/gossips"
                    className="block mt-4 text-blue-400 underline text-sm"
                >
                    Browse gossips first
                </Link>
            </div>
        </main>
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