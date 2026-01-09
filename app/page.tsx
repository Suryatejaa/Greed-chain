// "use client";
import Image from "next/image";
import logo from "../public/logo/s-logo.png";

export default function Home() {
  return (
    <main className="relative z-10 min-h-screen flex flex-col items-center justify-center bg-black/30 backdrop-blur-lg border border-white/20 text-white p-4">
      {/* // <main className="min-h-screen flex flex-col items-center justify-center bg-black/30 backdrop-blur-lg border border-white/20 text-white p-4"> */}
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">GreedChain</h1>

        <p className="mb-8 text-sm opacity-80">
          This is a social experiment. You don&apos;t really need to see if you don&apos;t want to.
          Just ignore and move on. Don&apos;t make a drama.
        </p>
        <p
          className="
    mb-8
    text-xs
    opacity-60
    leading-relaxed
    border
    border-white/15
    rounded-md
    px-3
    py-2
    animate-[gentleReveal_0.6s_ease-out_0.4s_both]
  "
        >
          No refunds. Payments are voluntary and final.
          Please participate only if you’re comfortable spending the amount.
        </p>


        <div className="flex flex-col gap-4">

          {/* Cashfree Fixed Button */}
          <PaymentCard amount={1} label="To see how many paid ONE rupee">
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
          <PaymentCard amount={5} label="To see how many paid FIVE rupees">
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
          <PaymentCard amount={11} label="To see how many paid ELEVEN rupees">
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
          Pay ₹{amount} {label && <span className="opacity-80">({label})</span>}
        </p>
      </div>
      {children}
    </div>
  );
}
