"use client";
import * as React from "react";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { DeleteModal } from "../modal/deleteModal";
import { useAtom } from "jotai";
import { chatInteractionsAtom, chatSessionsAtom, pendingUserQueryAtom } from "../store";
import { useGetAllChatSessionsByUID } from "@/hooks/chatAPIs/GET/useGetAllChatSessionsByUID";
import { auth } from "@/config/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDeleteChatSession } from "@/hooks/chatAPIs/DELETE/useDeleteChatSession";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SidebarItem() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [sessionIdToDelete, setSessionIdToDelete] = React.useState("");
  const queryClient = useQueryClient();

  // Atoms for managing chat data
  const [chatSessions, setChatSessions] = useAtom(chatSessionsAtom);
  const [, setChatInteractions] = useAtom(chatInteractionsAtom);
  const [, setPendingUserQuery] = useAtom(pendingUserQueryAtom);

  const { data: dbChatSessions, isLoading: isChatSessionLoading } =
    useGetAllChatSessionsByUID(user?.uid as string);
  const { mutateAsync: deleteSession, isPending: isDeleting } =
    useDeleteChatSession(user?.uid as string);

  React.useEffect(() => {
    if (dbChatSessions) {
      setChatSessions((prev) => {
        const newSessions = dbChatSessions.filter(
          (dbSession: any) =>
            !prev.some((prevSession) => prevSession.id === dbSession.id)
        );
        return [...prev, ...newSessions];
      });
    }
  }, [dbChatSessions, setChatSessions]);

  const onSessionDelete = async () => {
    if (!sessionIdToDelete) return;
    setChatSessions((prev) =>
      prev.filter((session) => session.id !== sessionIdToDelete)
    );

    try {
      await deleteSession(sessionIdToDelete);
      setDeleteDialogOpen(false);
      setPendingUserQuery(null);
      router.push("/chat");
      setSessionIdToDelete("");
      setChatInteractions({});
      queryClient.invalidateQueries({
        queryKey: ["getAllChatSessionsByUID"],
        exact: true,
      });
    } catch (error) {
      toast.error("Something went wrong, try again later");
      console.error("Error deleting session:", error);
    }
  };

  return (
    <div className="flex flex-col h-full w-[300px] overflow-y-scroll">
      <div className="flex items-center justify-between p-2 ml-2 mb-2">
        <h4 className="text-sm font-medium">Chat History</h4>
      </div>
      <div
        className="mb-2 px-2 flex justify-center align-center"
        onClick={() => {
          setChatInteractions({});
          setPendingUserQuery(null);
        }}
      >
        <Link
          href="/chat"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 w-full justify-start bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 rounded-md dark:hover:bg-zinc-300/10"
          )}
        >
          <Icons.Plus className="-translate-x-2 stroke-2 h-5 w-5" />
          New Chat
        </Link>
      </div>
      {isChatSessionLoading ? (
        <div className="flex flex-col flex-1 px-4 space-y-4 overflow-auto">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-6 rounded-md shrink-0 animate-pulse bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      ) : (
        chatSessions.map((session) => {
          const createdAtDate = new Date(session.createdAt);
          const formattedCreatedAt = createdAtDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <div
              key={session.id}
              className="flex flex-col p-3 mx-2 mt-1 border rounded-md hover:bg-accent cursor-pointer group"
              onClick={() => {
                router.push(`/chat/${session.id}`);
                setChatInteractions({});
                setPendingUserQuery(null);
              }}
            >
              <DeleteModal
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={onSessionDelete}
                loading={isDeleting}
              />
              <span className="font-medium text-sm truncate">
                {session.user_query}
              </span>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs">{formattedCreatedAt}</span>{" "}
                <div
                  className="flex invisible group-hover:visible"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSessionIdToDelete(session.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Icons.trash className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
