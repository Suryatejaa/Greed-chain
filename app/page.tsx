"use client";

import RazorpayButton from "./components/RazorpayButton";
import Image from "next/image";
import logo from "../public/logo/s-logo.png";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">GreedChain</h1>

        <p className="mb-8 text-sm opacity-60">
          This is a social experiment. You don&apos;t really need to see if you don&apos;t want to.
          Just ignore and move on. Don&apos;t make a scene.
        </p>

        <div className="flex flex-col gap-4">
          {/* ₹1 */}
          {/* <PaymentCard amount={1}>
            <RazorpayButton
              paymentButtonId="pl_Rz65r6ImL0PS8U"
              formId="razorpay-form-1"
            />
          </PaymentCard>

          {/* ₹5 */}
          {/* <PaymentCard amount={5}>
            <RazorpayButton
              paymentButtonId="pl_RzV5vndCmZSnu9"
              formId="razorpay-form-5"
            />
          </PaymentCard>

          {/* ₹11 */}
          {/* <PaymentCard amount={11}>
            <RazorpayButton
              paymentButtonId="pl_RzVCx1Qq9r0JoZ"
              formId="razorpay-form-11"
            />
          </PaymentCard> */}

          {/* Cashfree Fixed Button */}
          <PaymentCard amount={1}>
            <a
              href="https://payments.cashfree.com/forms/rupee"
              target="_parent"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-black rounded-md px-3 py-2 bg-white text-black hover:bg-gray-100"
            >
              <Image src={logo} alt="Cashfree" width={20} height={20} />
              <span className="text-sm font-medium">Pay ₹1</span>
            </a>
          </PaymentCard>
          <PaymentCard amount={5}>
            <a
              href="https://payments.cashfree.com/forms/five-rupees"
              target="_parent"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-black rounded-md px-3 py-2 bg-white text-black hover:bg-gray-100"
            >
              <Image src={logo} alt="Cashfree" width={20} height={20} />
              <span className="text-sm font-medium">Pay ₹5</span>
            </a>
          </PaymentCard>
          <PaymentCard amount={11}>
            <a
              href="https://payments.cashfree.com/forms/eleven-rupees"
              target="_parent"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-black rounded-md px-3 py-2 bg-white text-black hover:bg-gray-100"
            >
              <Image src={logo} alt="Cashfree" width={20} height={20} />
              <span className="text-sm font-medium">Pay ₹11</span>
            </a>
          </PaymentCard>
        </div>
      </div>
    </main>
  );
}

/* ---------- Reusable Card ---------- */

function PaymentCard({
  amount,
  label,
  children,
}: {
  amount: number;
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col p-4 border border-white/20 rounded-lg hover:border-white/40 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <p className="text-lg font-semibold">
          Pay ₹{amount} {label && <span className="opacity-50">({label})</span>}
        </p>
      </div>
      {children}
    </div>
  );
}
