"use client";
import {Header} from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { auth } from "@/config/firebaseConfig";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div>
      {loading ? (
        <div className="flex h-screen items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="flex h-screen flex-col">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="overflow-y-auto w-full">{children}</main>
          </div>
        </div>
      )}
    </div>
  );
}
