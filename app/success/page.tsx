"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
    const params = useSearchParams();
    const paymentId = params.get("payment_id");
    const [status, setStatus] = useState("verifying");
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        if (!paymentId) return;

        fetch(`/api/verify-payment?payment_id=${paymentId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus("success");
                    setData(data);
                } else {
                    setStatus("failed");
                }
            });
    }, [paymentId]);

    return (
        <main className="min-h-screen flex items-center justify-center bg-black text-white">
            {status === "verifying" && <h1>Verifying your payment…</h1>}
            {status === "success" && (
                <div className="max-w-md text-center">
                    <h1 className="text-5xl font-bold mb-4">
                        #{(data as any).rank}
                    </h1>

                    <p className="text-lg mb-6 opacity-80">
                        You showed up earlier than most people.
                    </p>                    

                    <p className="italic opacity-60 mb-6">
                        Greed or curiosity? Hard to tell.
                    </p>

                    <button
                        onClick={() => {
                            navigator.share?.({
                                title: "GreedChain",
                                text: `I paid ₹1 and got ranked #${(data as any).rank} on GreedChain. See where you stand.`,
                                url: window.location.origin,
                            }) || navigator.clipboard.writeText(
                                `I paid ₹1 and got ranked #${(data as any).rank} on GreedChain. See where you stand: ${window.location.origin}`
                            );
                        }}
                        className="bg-white text-black px-6 py-3 rounded-xl font-semibold"
                    >
                        Share & Challenge Friends
                    </button>

                    <p className="text-xs opacity-40 mt-6">
                        No rewards. No refunds. Just a number.
                    </p>
                </div>
            )}
            {status === "failed" && <h1>Payment failed ❌</h1>}
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