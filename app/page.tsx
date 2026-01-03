import Link from "next/link";
import CashfreeButton from "./components/CashfreeButton";
import CashfreeButton2 from "./components/CashfreeButton2";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">GreedChain</h1>

        <p className="mb-2 opacity-80">
          Paid narrative archaeology. One sentence at a time.
        </p>

        <p className="mb-8 text-sm opacity-60">
          Pay to participate. Rank determines order.
        </p>

        <div className="space-y-4 mb-8">
          <div>
            <p className="text-sm opacity-70 mb-3">₹1 - Add a sentence</p>
            <CashfreeButton />
          </div>

          <div>
            <p className="text-sm opacity-70 mb-3">₹2 - Create a gossip</p>
            <CashfreeButton2 />
          </div>
        </div>

        <Link
          href="/gossips"
          className="text-blue-400 underline text-sm"
        >
          Browse existing gossips
        </Link>

        <p className="text-xs opacity-40 mt-8">
          No rewards. No refunds. Just stories.
          <br />
          All content is fictional. User-submitted.
        </p>
      </div>
    </main>
  );
}