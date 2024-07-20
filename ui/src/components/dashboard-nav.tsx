"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { NavItem } from "@/types";
import { Dispatch, SetStateAction } from "react";
import { CircleDollarSign } from "lucide-react";
import { UserNav } from "./layout/user-nav";
import { Separator } from "./ui/separator";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/config/firebaseConfig";

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

export function DashboardNav({ items, setOpen }: DashboardNavProps) {
  const path = usePathname();
  const [user] = useAuthState(auth);

  let displayName: string =
    user?.displayName && user?.displayName.length > 0
      ? user?.displayName
      : user?.email?.split("@")[0] || "";

  if (!items?.length) {
    return null;
  }

  return (
    <nav className="items-start gap-2 flex flex-col justify-between h-full">
      <div className="flex flex-col gap-2 w-full">
        {items.map((item, index) => {
          const Icon = Icons[item.icon || "arrowRight"];
          return (
            item.href && (
              <Link
                key={index}
                href={item.disabled ? "/" : item.href}
                onClick={() => {
                  if (setOpen) setOpen(false);
                }}
              >
                <span
                  className={cn(
                    "group flex items-center rounded-[5px] px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    path === item.href ? "bg-accent" : "transparent",
                    item.disabled && "cursor-not-allowed opacity-80"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4 font-medium" />
                  <span className="font-medium">{item.title}</span>
                </span>
              </Link>
            )
          );
        })}
      </div>

      <div className="absolute bottom-5 left-5 w-full flex items-center text-sm font-medium gap-4 border-t-primary-foreground">
        <div>
          <Avatar className="border h-[35px] w-[35px]">
            <AvatarImage alt="ABD" src={user?.photoURL as string} />
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col w-[100px] gap-1">
          <h1 className="font-medium text-sm truncate">{displayName}</h1>
        </div>

        <div className="flex justify-end">
          <UserNav />
        </div>
      </div>
    </nav>
  );
}
