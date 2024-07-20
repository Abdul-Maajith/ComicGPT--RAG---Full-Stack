"use client";

import * as React from "react";

import { cn, isEmailSpam } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/config/firebaseConfig";
import {
  useSignInWithGoogle,
  useSendSignInLinkToEmail,
} from "react-firebase-hooks/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import saveUserOnDB from "@/lib/auth";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [signInWithGoogle] = useSignInWithGoogle(auth);
  const [sendSignInLinkToEmail] = useSendSignInLinkToEmail(auth);
  const router = useRouter();

  async function passwordlessLogin(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading("passwordless");

    if (email === "") {
      setIsLoading("");
      toast.error("Please enter an email");
      return;
    }

    if (isEmailSpam(email)) {
      setIsLoading("");
      toast.error(
        "Please enter an valid email, please contact support if this problem persists"
      );
    }

    const actionCodeSettings = {
      url: `${
        window.location.origin
      }/email-verification?email=${encodeURIComponent(email)}`,
      handleCodeInApp: true,
    };

    try {
      const success = await sendSignInLinkToEmail(email, actionCodeSettings);

      if (success) {
        localStorage.setItem("emailForSignIn", email);
        console.log("Sign-in link sent to email");
        toast.success("We've sent a unique login link to your email.");
      } else {
        console.error("Authentication failed.");
        toast.error("Authentication failed, please try again");
        setIsLoading("");
      }
      setIsLoading("");
    } catch (error) {
      console.error(error);
      setIsLoading("");
    }
  }

  const socialSignup = async () => {
    setIsLoading("google");
    try {
      const userData = await signInWithGoogle();
      if (userData) {
        localStorage.setItem("user", "true");

        await saveUserOnDB(userData.user);
        setIsLoading("");
        router.push("/chat");
      } else {
        console.error("Sign-in with Google failed.");
        toast.error("Sign-in with Google failed, please try again");
        setIsLoading("");
      }
    } catch (error) {
      setIsLoading("");
      console.error(error);
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              // type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading !== ""}
            />
          </div>
          <Button
            variant={"outline"}
            disabled={isLoading !== ""}
            onClick={(e) => passwordlessLogin(e)}
          >
            {isLoading === "passwordless" && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Continue with Email
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        type="button"
        disabled={isLoading !== ""}
        onClick={() => socialSignup()}
      >
        {isLoading === "google" ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}{" "}
        Google
      </Button>
    </div>
  );
}
