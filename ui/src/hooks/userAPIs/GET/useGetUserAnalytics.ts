import { auth } from "@/config/firebaseConfig";
import AXIOS_BASE from "@/lib/apiBase";
import { useQuery } from "@tanstack/react-query";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "sonner";

export const useGetUserAnalytics = () => {
  const [user] = useAuthState(auth);

  const fetchUserAnalyticsDetails = async () => {
    try {
      const url = `api/fetch/user/analytics?uid=${user?.uid}`;
      const userAnalyticsDetail = await AXIOS_BASE.get(url);

      if (userAnalyticsDetail.status === 200) {
        return userAnalyticsDetail.data;
      }
    } catch (error) {
      toast.error(
        "Something went wrong, while fetching user analytics details, try again later"
      );
      console.error(error);
    }
  };

  return useQuery({
    queryKey: ["userAnalyticsDetails"],
    queryFn: fetchUserAnalyticsDetails,
  });
};
