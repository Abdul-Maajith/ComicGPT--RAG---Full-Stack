import AXIOS_BASE from "@/lib/apiBase";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useConfigureAPIKey = () => {
  const useConfigureAPIKeyMutation = async (apiKeyData: any) => {
    try {
      const url = `/api/user/configure/llm/key`;
      const resp = await AXIOS_BASE.post(url, apiKeyData);

      if (resp.status === 200) {
        toast.success("API key configured.");
        return resp.data;
      }
    } catch (error) {
      toast.error("Something went wrong configuring api key, try again later");
      console.error(error);
    }
  };

  const mutation = useMutation({
    mutationFn: useConfigureAPIKeyMutation,
    onError: (error: any) => {
      toast.error("Something went wrong configuring api key, try again later");
      console.error("Error configuring api key", error);
    },
  });

  return mutation;
};
