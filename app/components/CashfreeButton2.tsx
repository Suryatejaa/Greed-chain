"use client";

import logo from "../../public/logo/s-logo.png"

export default function CashfreeButton2() {
  return (
    <form>
      <a
        href="https://payments.cashfree.com/forms/create-greed-story"
        target="_parent"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
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
              Pay ₹2 - Create Story
            </div>
            <div
              style={{
                fontFamily: "Arial",
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


