"use client";

import { useEffect, useRef, useState } from "react";

interface RazorpayButtonProps {
  paymentButtonId: string;
  formId?: string;
}

export default function RazorpayButton({ 
  paymentButtonId, 
  formId = "razorpay-form" 
}: RazorpayButtonProps) {
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
      script.setAttribute("data-payment_button_id", paymentButtonId);
      
      // Add error handling
      script.onerror = () => {
        console.error("Failed to load Razorpay payment button script");
      };

      formRef.current.appendChild(script);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isReady, paymentButtonId]);

  return (
    <form
      ref={formRef}
      id={formId}
      className="razorpay-payment-button"
    ></form>
  );
}