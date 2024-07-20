import { User } from "@firebase/auth";
import AXIOS_BASE from "./apiBase";
import { toast } from "sonner";

async function saveUserOnDB(user: User) {
  try {
    let displayName: string =
      user?.displayName && user?.displayName.length > 0
        ? user?.displayName
        : user?.email?.split("@")[0] || "";

    let userDetails = {
      uid: user?.uid,
      name: displayName,
      email: user?.email as string,
      photoURL: user?.photoURL as string,
      plan: "free-tier"
    };

    const url = "/api/register/user";
    const resp = await AXIOS_BASE.post(url, userDetails);
    if (resp.status === 200) {
      console.log("User data has been successfully saved onto DB");
      return resp.data;
    }
  } catch (error) {
    toast.error("Something went wrong, please try again");
    console.error(error);
  }
}

export default saveUserOnDB;