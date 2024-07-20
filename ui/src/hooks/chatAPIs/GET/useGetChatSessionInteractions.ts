import { pendingUserQueryAtom } from "@/components/store";
import AXIOS_BASE from "@/lib/apiBase";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useGetChatSessionInteractions = (
  uid: string,
  chatId: string,
  pendingUserQuery: string
) => {
  const router = useRouter();

  const fetchSessionInteractions = async () => {
    if (pendingUserQuery !== null) {
      return null;
    }

    try {
      const url = `api/chat/interactions/${chatId}?user_id=${uid}`;
      const response = await AXIOS_BASE.get(url);

      if (response.status === 200) {
        return response.data;
      } else {
        router.push("/chat");
        throw new Error("Failed to fetch session interactions");
      }
    } catch (error) {
      toast.error("Something went wrong, try again later");
      console.error(error);
      router.push("/chat");
    }
  };

  return useQuery({
    queryKey: ["getChatSessionInteractions", uid, chatId],
    queryFn: fetchSessionInteractions,
    enabled: !!chatId,
    refetchOnWindowFocus: false,
  });
};
