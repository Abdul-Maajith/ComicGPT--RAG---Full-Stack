import { auth } from "@/config/firebaseConfig";
import AXIOS_BASE from "@/lib/apiBase";
import { useQuery } from "@tanstack/react-query";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "sonner";

export const useUserDetails = () => {
  const [user] = useAuthState(auth);

  const fetchUserDetails = async () => {
    try {
      const url = `api/fetch/user/details?uid=${user?.uid}`;
      const userDetail = await AXIOS_BASE.get(url);

      if (userDetail.status === 200) {
        console.log("User Details: ");
        console.log(userDetail.data);
        return userDetail.data;
      }
    } catch (error) {
      toast.error(
        "Something went wrong, while fetching user details, try again later"
      );
      console.error(error);
    }
  };

  return useQuery({
    queryKey: ["userDetails"],
    queryFn: fetchUserDetails,
  });
};