import AXIOS_BASE from "@/lib/apiBase";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface UploadFileOptions {
  onSuccess?: () => void;
}

export const useLoadDocument = ({onSuccess}: UploadFileOptions) => {
  const createLoadDocumentMutation = async (newDocumentLoad: any) => {
    try {
      const url = `/api/load/document/?uid=${newDocumentLoad.uid}&loader=${newDocumentLoad.loader}`;
      const resp = await AXIOS_BASE.post(url, newDocumentLoad.data);

      if (resp.status === 200) {
        onSuccess && onSuccess();
        return resp.data;
      }
    } catch (error) {
      toast.error("Something went wrong, loading documents, try again later");
      console.error(error);
    }
  };

  const mutation = useMutation({
    mutationFn: createLoadDocumentMutation,
    onError: (error: any) => {
      toast.error("Something went wrong, loading documents, try again later");
      console.error("Error loading document", error);
    },
  });

  return mutation;
};
