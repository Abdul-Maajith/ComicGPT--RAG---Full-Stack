import React, { useEffect, useState } from "react";
import { EmptyScreen } from "./empty-screen";
import { PromptForm } from "../forms/PromptForm";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { chatInteractionsAtom, chatSessionsAtom, currentChatIdAtom, pendingUserQueryAtom } from "../store";

const ChatHome = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const [, setChatSessions] = useAtom(chatSessionsAtom);
  const [, setCurrentChatId] = useAtom(currentChatIdAtom);
  const [, setPendingUserQuery] = useAtom(pendingUserQueryAtom);

  const handleChat = async (value: string) => {
    setIsLoading(true);
    const chatId = uuidv4();

    setChatSessions((prev) => [
      { id: chatId, user_query: value, createdAt: new Date() },
      ...prev,
    ]);

    setCurrentChatId(chatId);
    setPendingUserQuery(value);
  
    await router.push(
      `/chat/${chatId}`
    );
    setIsLoading(false);
  };

  return (
    <div className="flex h-full flex-col p-4 justify-between mr-3 pt-2">
      <div className="space-y-2 overflow-y-scroll scrollbar-none">
        <EmptyScreen onExampleClick={async (value: any) => {
          handleChat(value);
        }} />
      </div>

      <PromptForm
        isLoading={isLoading}
        onSubmit={async (value: any) => {
          handleChat(value);
        }}
      />
    </div>
  );
};

export default ChatHome;
