import AXIOS_BASE from "@/lib/apiBase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteFile = (uid: string) => {
  const queryClient = useQueryClient();

  const deleteFileMutation = async ({ fileId }: { fileId: string }) => {
    try {
      const url = `api/delete/file/${fileId}?uid=${uid}`;
      const response = await AXIOS_BASE.delete(url);
      if (response.status === 200) {
        toast.success("file deleted successfully");
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
    mutationFn: (fileId: string) => deleteFileMutation({ fileId }),
    onSuccess: () => {
      // Invalidate the queries that need to be refetched after deletion
      queryClient.invalidateQueries({
        queryKey: ["getAllFiles", uid],
      });
    },
    onError: (error: any) => {
      toast.error("Something went wrong, try again later");
      console.error("Error deleting session:", error);
    },
  });

  return mutation;
};
