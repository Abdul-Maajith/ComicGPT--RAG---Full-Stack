import AXIOS_BASE from "@/lib/apiBase";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetAllFiles = (uid: string) => {
  const fetchFilesDetails = async () => {
    try {
      const url = `api/get/all/files/${uid}`;
      const filesDetail = await AXIOS_BASE.get(url);

      if (filesDetail.status === 200) {
        return filesDetail.data;
      }
    } catch (error) {
      toast.error("Something went wrong, try again later");
      console.error(error);
    }
  };

  return useQuery({
    queryKey: ["getAllFiles", uid],
    queryFn: fetchFilesDetails,
  });
};
