import React, { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/config/firebaseConfig";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";
import { TypedMarkdown } from "../ui/TypedMarkdown";
import { PromptForm } from "../forms/PromptForm";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import {
  chatInteractionsAtom,
  currentChatIdAtom,
  pendingUserQueryAtom,
} from "../store";
import { useGetChatSessionInteractions } from "@/hooks/chatAPIs/GET/useGetChatSessionInteractions";
import { ButtonScrollToBottom } from "./button-scroll-to-bottom";
import { useScrollAnchor } from "@/hooks/utilHooks/use-scroll-anchor";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

const Chats: React.FC<{ chatId: string }> = ({ chatId }) => {
  const [user] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const submissionInProgress = useRef(false);

  const [chatInteractions, setChatInteractions] = useAtom(chatInteractionsAtom);
  const [, setCurrentChatId] = useAtom(currentChatIdAtom);
  const [pendingUserQuery, setPendingUserQuery] = useAtom(pendingUserQueryAtom);

  const router = useRouter();

  const {
    data: dbInteractions,
    isLoading: interactionsLoading,
    refetch,
  } = useGetChatSessionInteractions(
    user?.uid as string,
    chatId,
    pendingUserQuery as string
  );

  useEffect(() => {
    setCurrentChatId(chatId);
  }, [chatId, setCurrentChatId]);

 useEffect(() => {
   if (dbInteractions && !pendingUserQuery) {
     const interactionsForChat = dbInteractions.map((interaction: any) => {
       const { user, ai } = interaction.chatInteractions;
       return [
         { role: "user", content: user },
         { role: "ai", content: ai },
       ];
     });

     setChatInteractions((prev) => ({
       ...prev,
       [chatId]: interactionsForChat.flat(),
     }));
   }
 }, [dbInteractions, chatId, pendingUserQuery, setChatInteractions]);

  const onSubmit = async (value: string) => {
    if (submissionInProgress.current) return;
    submissionInProgress.current = true;

    setIsLoading(true);
    setChatInteractions((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), { role: "user", content: value }],
    }));

    console.log("Hitting Server")

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user?.uid as string,
          chatId: chatId,
          userInput: value,
        }),
      });

      if (!response.ok) {
        toast.error("Something went wrong, please try again later");
        router.push("/chat");
        throw new Error("Network response was not ok");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        toast.error("Something went wrong, please try again later");
        router.push("/chat");
        throw new Error("Error getting response reader");
      }

      let aiContent = "";

      setChatInteractions((prev) => ({
        ...prev,
        [chatId]: [
          ...(prev[chatId] || []),
          { role: "ai", content: "", type: "on_chat_model_stream" },
        ],
      }));

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const content = line.slice(6);
            if (content !== "None") {
              aiContent += content;
              setChatInteractions((prev) => {
                const updatedInteractions = [...prev[chatId]];
                updatedInteractions[updatedInteractions.length - 1] = {
                  ...updatedInteractions[updatedInteractions.length - 1],
                  content: aiContent,
                };
                return { ...prev, [chatId]: updatedInteractions };
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in SSE:", error);
      router.push("/chat");
      toast.error("Something went wrong, please try again later");
      submissionInProgress.current = false;
    } finally {
      setIsLoading(false);
      submissionInProgress.current = false;
    }
  }

  useEffect(() => {
    if (pendingUserQuery && !submissionInProgress.current) {
      onSubmit(pendingUserQuery);
      setPendingUserQuery(null);
    }
  }, [pendingUserQuery, setPendingUserQuery]);

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor();

  const currentInteractions = chatInteractions[chatId] || [];

  return (
    <div className="flex h-full flex-col w-full md:w-[65%] p-4 justify-between mr-3 pt-2">
      <div
        ref={messagesRef}
        className="space-y-2 overflow-y-scroll scrollbar-none"
        style={{ maxHeight: "calc(100vh - 165px)" }}
      >
        {interactionsLoading ? (
          <>
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton
                key={i}
                className="flex h-10 items-center align-middle space-x-2 border p-2 rounded-md"
              />
            ))}
          </>
        ) : (
          currentInteractions.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className="flex align-middle space-x-2 border p-2 rounded-md min-h-[40px]"
            >
              <ButtonScrollToBottom
                isAtBottom={isAtBottom}
                scrollToBottom={scrollToBottom}
              />
              <div className="flex items-start">
                <Avatar className="ml-2 mt-1 h-[30px] w-[30px]">
                  <AvatarImage
                    alt="img"
                    src={
                      message.role === "user"
                        ? (user?.photoURL as string)
                        : "https://api.dicebear.com/8.x/pixel-art/svg?seed=Sophie"
                    }
                  />
                  <AvatarFallback>
                    {message.role === "user" ? "U" : "AI"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col m-2 px-2">
                <p
                  className={`flex-1 text-base ${
                    message.role === "user"
                      ? "text-[#ffffff]"
                      : "text-[#D1D5DB]"
                  }`}
                >
                  {message.type === "on_chat_model_stream" ? (
                    <TypedMarkdown chunks={message.content.split("")} />
                  ) : (
                    <Markdown
                      rehypePlugins={[rehypeRaw]}
                      remarkPlugins={[remarkGfm, remarkMath]}
                    >
                      {message.content}
                    </Markdown>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      <PromptForm isLoading={isLoading} onSubmit={onSubmit} />
    </div>
  );
};

export default Chats;
