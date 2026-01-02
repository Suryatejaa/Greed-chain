import RazorpayButton from "./components/RazorpayButton";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-4xl font-bold mb-4">GreedChain</h1>

      <p className="mb-6">
        Pay ₹1 to see where you stand.
      </p>

      <RazorpayButton />

      <p className="text-xs opacity-50 mt-6">
        Payment handled by Razorpay.
      </p>
    </main>
  );
}