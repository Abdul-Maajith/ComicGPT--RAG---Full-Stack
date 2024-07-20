"use client"

import Chats from "@/components/chat/chat";
import React from "react";

const page = ({ params }: { params: { chatId: string } }) => {
  return (
    <div className="flex justify-center h-full w-full dark:from-background/10 dark:from-10% dark:to-background/80 bg-primary-foreground">
      <Chats chatId={params.chatId} />
    </div>
  );
};

export default page;
