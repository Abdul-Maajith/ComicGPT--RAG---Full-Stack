import AXIOS_BASE from "@/lib/apiBase";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useOnBoardUser = () => {
  const router = useRouter();

  const useOnBoardUserMutation = async (onBoardingData: any) => {
    try {
      const url = `/api/user/onboarding/data`;
      const resp = await AXIOS_BASE.post(url, onBoardingData);

      if (resp.status === 200) {
        toast.success("Welcome to agentstacks");
        return resp.data;
      }
    } catch (error) {
      toast.error("Something went wrong onboarding user, try again later");
      console.error(error);
    }
  };

  const mutation = useMutation({
    mutationFn: useOnBoardUserMutation,
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error("Something went wrong onboarding user, try again later");
      console.error("Error onboarding user", error);
    },
  });

  return mutation;
};
