import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { UserMenu } from "./user-menu";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/config/firebaseConfig";
import ConfigureAPIKeyModal from "../modal/configureAPIKeyModal";
import { MobileSidebar } from "./mobile-sidebar";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { chatInteractionsAtom, pendingUserQueryAtom } from "../store";

function UserInfo() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  const [, setChatInteractions] = useAtom(chatInteractionsAtom);
  const [, setPendingUserQuery] = useAtom(pendingUserQueryAtom);

  return (
    <>
      <div className="hidden lg:block">
        <div
          className="flex"
          onClick={() => {
            setChatInteractions({});
            setPendingUserQuery(null);
            router.push("/chat")
          }}
        >
          <span className="font-bold cursor-pointer">ComicGPT</span>
        </div>
      </div>
      <div className={cn("block lg:!hidden")}>
        <MobileSidebar />
      </div>
      <div className="flex items-center">
        <Icons.Separator className="size-6 text-muted-foreground/50" />
        <UserMenu />
      </div>
    </>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <UserInfo />
      </div>
      <div className="flex items-center justify-end space-x-2">
        <a
          target="_blank"
          href="https://github.com/Abdul-Maajith"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <Icons.gitHub className="h-5 w-5" />
          <span className="hidden ml-2 md:flex">GitHub</span>
        </a>
        <ConfigureAPIKeyModal provider={"openai"} />
      </div>
    </header>
  );
}
