import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import AXIOS_BASE from "@/lib/apiBase";

interface UploadFileOptions {
  uid: string; // Add uid to the options
  onUploadProgress?: (progressEvent: any) => void;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useUploadFile = ({
  uid,
  onUploadProgress,
  onSuccess,
  onError,
}: UploadFileOptions) => {
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const resp = await AXIOS_BASE.post(
        `/api/upload/file/?uid=${uid}`,
        formData,
        {
          onUploadProgress: onUploadProgress,
        }
      );

      if (resp.status === 200) {
        onSuccess && onSuccess();
        return resp.data;
      } else {
        onError &&
          onError(new Error(resp.data.message || "Failed to upload file"));
        throw new Error(resp.data.message || "Failed to upload file");
      }
    },
  });

  return { uploadFileMutation };
};
