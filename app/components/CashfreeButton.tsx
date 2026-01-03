"use client";

import Image from "next/image";
import logo from "../../public/logo/s-logo.png"

export default function CashfreeButton() {
  const handleClick = () => {
    // Store payment info in sessionStorage before redirect
    sessionStorage.setItem("cashfree_amount", "1");
    // Note: We can't get order_id/payment_id before payment, but we store amount
  };

  return (
    <form>
      <a
        href="https://payments.cashfree.com/forms/greed-chain"
        target="_parent"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
        onClick={handleClick}
      >
        <div
          style={{
            border: "1px solid black",
            borderRadius: "5px",
            display: "flex",
            padding: "1px",
            width: "fit-content",
            cursor: "pointer",
            background: "#ffffff",
          }}
        >
          <div>
            <img
              src={logo.src}
              alt="GreedChain Logo"
              style={{
                width: "40px",
                height: "40px",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginLeft: "5px",
              justifyContent: "center",
              marginRight: "5px",
            }}
          >
            <div
              style={{
                fontFamily: "Verdana",
                color: "#000000",
                marginBottom: "5px",
                fontSize: "14px",
              }}
            >
              Pay ₹1 - Access Story
            </div>
            <div
              style={{
                fontFamily: "Verdana",
                color: "#000000",
                fontSize: "10px",
              }}
            >
              <span>Powered By Cashfree</span>
              {/* <img
                src="https://cashfreelogo.cashfree.com/cashfreepayments/logosvgs/Group_4355.svg"
                alt="logo"
                style={{
                  width: "16px",
                  height: "16px",
                  verticalAlign: "middle",
                  marginLeft: "4px",
                }}
              /> */}
            </div>
          </div>
        </div>
      </a>
    </form>
  );
}

