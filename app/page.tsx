"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RazorpayButton from "./components/RazorpayButton";

export default function Home() {
  const router = useRouter();
  const [hasPayment, setHasPayment] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if payment exists in sessionStorage
    const paymentId = sessionStorage.getItem("razorpay_payment_id");
    
    if (paymentId) {
      // Verify the payment is still valid
      fetch(`/api/check-payment?payment_id=${paymentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.exists) {
            // Payment exists and is valid, redirect to stories
            router.push("/stories");
          } else {
            // Payment doesn't exist or is invalid, clear sessionStorage
            sessionStorage.removeItem("razorpay_payment_id");
            sessionStorage.removeItem("razorpay_payment_amount");
            sessionStorage.removeItem("razorpay_payment_rank");
            setHasPayment(false);
          }
        })
        .catch(() => {
          // Error checking payment, clear and show payment button
          sessionStorage.removeItem("razorpay_payment_id");
          sessionStorage.removeItem("razorpay_payment_amount");
          sessionStorage.removeItem("razorpay_payment_rank");
          setHasPayment(false);
        });
    } else {
      // No payment in sessionStorage
      setHasPayment(false);
    }
  }, [router]);

  // Show loading while checking sessionStorage
  if (hasPayment === null) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
        <div className="max-w-md w-full text-center">
          <p className="opacity-60">Checking access...</p>
        </div>
      </main>
    );
  }

  // Show payment button if no valid payment
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">GreedChain</h1>

        <p className="mb-2 opacity-80">
          Paid narrative archaeology. One sentence at a time.
        </p>

        <p className="mb-8 text-sm opacity-60">
          Pay ₹1 to enter. View stories. Add one sentence.
        </p>

        <div className="mb-8 flex flex-col items-center">
          <p className="text-sm opacity-70 mb-3">₹1 - Enter & Add a sentence</p>
          <RazorpayButton />
        </div>

        <p className="text-xs opacity-40 mt-8">
          No rewards. No refunds. Just stories.
          <br />
          All content is fictional. User-submitted.
        </p>
      </div>
    </main>
  );
}