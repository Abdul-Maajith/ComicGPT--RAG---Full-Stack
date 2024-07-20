import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";

export default function Sidebar() {
  return (
    <nav className={cn(`relative hidden h-screen border-r lg:block w-[300px]`)}>
      <div className="space-y-4 py-2 h-full">
        <SidebarItem />
      </div>
    </nav>
  );
}
