import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/config/firebaseConfig";
import { useRouter } from "next/navigation";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import { toast } from "sonner";

export function UserMenu() {
  const router = useRouter();
  const [signOut] = useSignOut(auth);
  const [user] = useAuthState(auth);

  const logoutUser = async () => {
    const loggedOut = await signOut();
    router.push("/");
    if (loggedOut) {
      toast.success("You account has been successfully logged out");
      localStorage.removeItem("user");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="pl-0">
            <span className="ml-2 hidden md:block">
              {user?.email as string}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} align="start" className="w-fit">
          <DropdownMenuItem className="flex-col items-start">
            <div className="text-xs text-zinc-500">{user?.email as string}</div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <button
            className=" relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors hover:bg-red-500 hover:text-white focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            onClick={() => logoutUser()}
          >
            Sign Out
          </button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
