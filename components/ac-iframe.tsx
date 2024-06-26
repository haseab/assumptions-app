"use client";

import { env } from "@/env.mjs";
import { useEffect, useState } from "react";

const FullPageIframe = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // or whatever breakpoint you prefer
    };

    // Check on mount
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <>
      <div className="flex flex-row h-screen w-screen items-center justify-center rounded-lg bg-white">
        <div className="max-h-full w-full h-full md:w-[1000px] md:h-[800px]">
          <iframe
            src={env.NEXT_PUBLIC_CHATBOT_LINK}
            width="100%"
            height="100%"
            style={{
              width: isMobile ? "100dvw" : "100%",
              height: isMobile ? "100dvh" : "100%",
              boxShadow:
                "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(150, 150, 150, 0.2) 0px 0px 0px 1px",
              borderRadius: "10px",
              margin: "auto",
            }}
          ></iframe>
        </div>
      </div>
    </>
  );
};

export default FullPageIframe;
