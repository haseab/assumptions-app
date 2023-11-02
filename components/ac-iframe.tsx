// pages/page.tsx

import React from "react";

const FullPageIframe: React.FC = () => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        margin: 0,
        padding: 0,
      }}
    >
      <iframe
        src="https://automatic.chat/chats/clnnq22vx018bmc0yxcg48980/share"
        style={{ height: "100%", width: "100%", border: "none" }}
        title="Full Page Iframe"
      />
    </div>
  );
};

export default FullPageIframe;
