import { auth } from "@/config/firebaseConfig";
import AXIOS_BASE from "@/lib/apiBase";
import { useQuery } from "@tanstack/react-query";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "sonner";

export const useGetAllChatSessionsByUID = (uid: string) => {
  const fetchSessionDetails = async () => {
    try {
      const url = `api/chat/sessions?uid=${uid}`;
      const sessionDetail = await AXIOS_BASE.get(url);

      if (sessionDetail.status === 200) {
        return sessionDetail.data;
      }
    } catch (error) {
      toast.error("Something went wrong, try again later");
      console.error(error);
    }
  };

  return useQuery({
    queryKey: ["getAllChatSessionsByUID", uid],
    queryFn: fetchSessionDetails,
    enabled: !!uid,
    refetchOnWindowFocus: false,
  });
};
