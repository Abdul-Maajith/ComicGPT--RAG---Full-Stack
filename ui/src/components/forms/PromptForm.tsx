"use client";

import * as React from "react";
import Textarea from "react-textarea-autosize";

import { useEnterSubmit } from "@/hooks/utilHooks/use-enter-submit";
import { useRouter } from "next/navigation";
import { RxArrowUp, RxPlus, RxStop } from "react-icons/rx";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "../ui/spinner";

export interface PromptProps {
  onSubmit: (value: string) => Promise<void>;
  isLoading: boolean;
}

export function PromptForm({ isLoading, onSubmit }: PromptProps) {
  const [input, setInput] = React.useState<string>();
  const router = useRouter();
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!input?.trim()) {
          return;
        }
        setInput("");
        await onSubmit(input);
      }}
      ref={formRef}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background rounded-md px-8 sm:rounded-2xl sm:border sm:px-12">
        <button
          onClick={() => {
            router.push("/chat")
          }}
          className={cn(
            buttonVariants({ size: "sm", variant: "outline" }),
            "absolute left-2 top-4 h-8 w-8 rounded-full bg-background p-0 sm:left-4"
          )}
        >
          <RxPlus />
          <span className="sr-only">New Chat</span>
        </button>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message."
          spellCheck={false}
          className="min-h-[60px] sm:w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
        />
        <div className="absolute right-2 top-2.5 sm:right-4">
          <Button
            type="submit"
            className={cn(
              buttonVariants({ size: "sm", variant: "secondary" }),
              "mt-1 h-8 w-8 rounded-md p-0"
            )}
          >
            {isLoading ? <Spinner /> : <RxArrowUp size="18px" />}
          </Button>
        </div>
      </div>
    </form>
  )
}
