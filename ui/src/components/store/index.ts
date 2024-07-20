import { atom } from "jotai";

type ChatSession = {
  id: string;
  user_query: string;
  createdAt: Date;
};

type ChatInteraction = {
  role: "user" | "ai";
  content: string;
  type?: "on_chat_model_stream" | "on_chain_end";
};

export const chatSessionsAtom = atom<ChatSession[]>([]);
export const currentChatIdAtom = atom<string | null>(null)
export const chatInteractionsAtom = atom<Record<string, ChatInteraction[]>>({});
export const pendingUserQueryAtom = atom<string | null>(null);
