"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";

const FullPageIframe = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params?.id;

  const { closeChatButton: closeChatButtonString } = Object.fromEntries(
    searchParams!.entries()
  );

  const closeChatButton = closeChatButtonString === "true";

  return (
    <div className="flex flex-row h-screen w-screen items-center justify-center rounded-lg bg-white">
      <div className="h-screen w-screen lg:h-[600px] lg:w-[500px]">
        <iframe
          src={`https://automatic.chat/chats/clnnq22vx018bmc0yxcg48980?closeChatButton=${closeChatButton}`}
          // src={`http://localhost:3000/chats/clotv15pr002clu4ekrrwyn31`}
          width="100%"
          height="100%"
          style={{
            boxShadow:
              "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(150, 150, 150, 0.2) 0px 0px 0px 1px",
            borderRadius: "10px",
            margin: "auto",
          }}
        ></iframe>
      </div>
    </div>
  );
};

export default FullPageIframe;
