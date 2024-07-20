import AXIOS_BASE from "@/lib/apiBase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteChatSession = (userId: string) => {
  const queryClient = useQueryClient();

  const deleteSessionMutation = async ({ chatId }: { chatId: string }) => {
    try {
      const url = `api/delete/chat/sessions/${chatId}?user_id=${userId}`;
      const response = await AXIOS_BASE.delete(url);
      if (response.status === 200) {
        toast.success("Session deleted successfully");
      } else {
        toast.error("Something went wrong, try again later");
        throw new Error("Failed to delete session");
      }
    } catch (error) {
      toast.error("Something went wrong, try again later");
      console.error(error);
    }
  };

  const mutation = useMutation({
    mutationFn: (chatId: string) => deleteSessionMutation({ chatId }),
    onSuccess: () => {
      // Invalidate the queries that need to be refetched after deletion
      queryClient.invalidateQueries({
        queryKey: ["getAllChatSessionsByUID"],
      });
    },
    onError: (error: any) => {
      toast.error("Something went wrong, try again later");
      console.error("Error deleting session:", error);
    },
  });

  return mutation;
};
