"use client";
import { Spinner } from "@/components/ui/spinner";
import saveUserOnDB from "@/lib/auth";
import {
  User,
  onAuthStateChanged,
  signInWithEmailLink,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { auth } from "@/config/firebaseConfig";

const EmailVerification = () => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // User is not signed in
        const email = localStorage.getItem("emailForSignIn");
        if (!email) {
          console.error("Email is required for sign in.");
          toast.error("Something went wrong, please try again later");
          return;
        }
        console.log("No user Exists.");

        try {
          // Sign in with the email link
          await signInWithEmailLink(auth, email, window.location.href);
        } catch (error) {
          console.error("Error signing in with email link:", error);
          toast.error("Error signing in. Please try again.");
        }
      } else {
        // User is signed in
        window.localStorage.removeItem("emailForSignIn");
        localStorage.setItem("user", "true");

        try {
          await saveUserOnDB(user);
          router.push("/chat");
        } catch (error) {
          console.error("Error signing in with email link:", error);
          toast.error("Error signing in. Please try again.");
        }
      }
    });

    return () => unsubscribe(); // Clean up the observer on unmount
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner />
    </div>
  );
};

export default EmailVerification;
