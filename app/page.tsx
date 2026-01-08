"use client";

import RazorpayButton from "./components/RazorpayButton";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">GreedChain</h1>

        <p className="mb-8 text-sm opacity-60">
          This is a social experiment. You don&apos;t really need to see if you don&apos;t want to. Just ignore it. Don&apos;t spread nonsense.
        </p>

        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row align-center justify-center gap-3 w-full">
            <div className="flex flex-col p-4 border border-white/20 rounded-lg hover:border-white/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <p className="text-lg font-semibold">Pay ₹1</p>
              </div>
              <RazorpayButton paymentButtonId="pl_Rz65r6ImL0PS8U" formId="razorpay-form-1" />
            </div>
            
            <div className="flex flex-col p-4 border border-white/20 rounded-lg hover:border-white/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <p className="text-lg font-semibold">Pay ₹5</p>
              </div>
              <RazorpayButton paymentButtonId="pl_RzV5vndCmZSnu9" formId="razorpay-form-5" />
            </div>
            
            <div className="flex flex-col p-4 border border-white/20 rounded-lg hover:border-white/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <p className="text-lg font-semibold">Pay ₹11</p>
              </div>
              <RazorpayButton paymentButtonId="pl_RzVCx1Qq9r0JoZ" formId="razorpay-form-10" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
