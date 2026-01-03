"use client";

import { useEffect, useRef, useState } from "react";

export default function RazorpayButton2() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure component is mounted and form is ready
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !formRef.current) return;

    // Check if script already exists
    if (formRef.current.querySelector('script[data-payment_button_id]')) {
      return;
    }

    // Use requestAnimationFrame to ensure DOM is ready
    const frameId = requestAnimationFrame(() => {
      if (!formRef.current) return;

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/payment-button.js";
      script.async = true;
      script.setAttribute("data-payment_button_id", "pl_RzK7n9dZfG5VJm");
      
      // Add error handling
      script.onerror = () => {
        console.error("Failed to load Razorpay payment button script");
      };

      formRef.current.appendChild(script);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isReady]);

  return (
    <form
      ref={formRef}
      id="razorpay-form"
      className="razorpay-payment-button"
    ></form>
  );
}