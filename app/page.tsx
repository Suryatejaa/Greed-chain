"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RazorpayButton from "./components/RazorpayButton";

export default function Home() {
  const router = useRouter();
  const [hasPayment, setHasPayment] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if payment exists in localStorage
    const paymentId = localStorage.getItem("razorpay_payment_id");
    
    if (paymentId) {
      // Verify the payment is still valid
      fetch(`/api/check-payment?payment_id=${paymentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.exists) {
            // Payment exists and is valid, redirect to stories
            router.push("/stories");
          } else {
            // Payment doesn't exist or is invalid, clear localStorage
            localStorage.removeItem("razorpay_payment_id");
            localStorage.removeItem("razorpay_payment_amount");
            localStorage.removeItem("razorpay_payment_rank");
            setHasPayment(false);
          }
        })
        .catch(() => {
          // Error checking payment, clear and show payment button
          localStorage.removeItem("razorpay_payment_id");
          localStorage.removeItem("razorpay_payment_amount");
          localStorage.removeItem("razorpay_payment_rank");
          setHasPayment(false);
        });
    } else {
      // No payment in localStorage
      setHasPayment(false);
    }
  }, [router]);

  // Show loading while checking localStorage
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
          Narrative archaeology. One sentence at a time.
        </p>

        <p className="mb-8 text-sm opacity-60">
          Exclusive access. Contribute once. Read forever.
        </p>

        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex flex-col items-center w-full max-w-xs">
            <p className="text-sm opacity-70 mb-4">Choose your tier</p>
            <div className="flex flex-col sm:flex-row align-center justify-center gap-3 w-full">
              <div className="flex flex-col p-4 border border-white/20 rounded-lg hover:border-white/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-lg font-semibold">Eye Witness</p>
                  <p className="text-sm opacity-60">₹1</p>
                </div>
                <ul className="text-xs opacity-70 space-y-1 mb-3">
                  <li>• Read all stories</li>
                  <li>• Contribute 1 sentence</li>
                </ul>
                <RazorpayButton paymentButtonId="pl_Rz65r6ImL0PS8U" formId="razorpay-form-1" />
              </div>
              
              <div className="flex flex-col p-4 border border-white/20 rounded-lg hover:border-white/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-lg font-semibold">Be A Pro</p>
                  <p className="text-sm opacity-60">₹5</p>
                </div>
                <ul className="text-xs opacity-70 space-y-1 mb-3">
                  <li>• Read all stories</li>
                  <li>• Contribute 3 sentences</li>
                  <li>• Create 1 story</li>
                </ul>
                <RazorpayButton paymentButtonId="pl_RzV5vndCmZSnu9" formId="razorpay-form-5" />
              </div>
              
              <div className="flex flex-col p-4 border border-white/20 rounded-lg hover:border-white/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-lg font-semibold">Maestro</p>
                  <p className="text-sm opacity-60">₹11</p>
                </div>
                <ul className="text-xs opacity-70 space-y-1 mb-3">
                  <li>• Read all stories</li>
                  <li>• Contribute 5 sentences</li>
                  <li>• Create 3 stories</li>
                </ul>
                <RazorpayButton paymentButtonId="pl_RzVCx1Qq9r0JoZ" formId="razorpay-form-10" />
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs opacity-40 mt-8">
          Curated stories. No edits. No refunds.
          <br />
          All content is fictional. User-submitted.
        </p>
      </div>
    </main>
  );
}