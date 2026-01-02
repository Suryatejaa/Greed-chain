"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const params = useSearchParams();
  const paymentId = params.get("payment_id");
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    if (!paymentId) return;

    fetch(`/api/verify-payment?payment_id=${paymentId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus("success");
        } else {
          setStatus("failed");
        }
      });
  }, [paymentId]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      {status === "verifying" && <h1>Verifying your payment…</h1>}
      {status === "success" && <h1>Payment verified ✅</h1>}
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