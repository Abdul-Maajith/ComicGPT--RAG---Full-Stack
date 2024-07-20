"use client";

import ChatHome from "@/components/chat/chatHome";
import { useRouter } from "next/navigation";

export default function page() {
  const router = useRouter();

  return (
    <div className="flex justify-center h-full w-full dark:from-background/10 dark:from-10% dark:to-background/80 bg-primary-foreground">
      <ChatHome />
    </div>
  );
}
