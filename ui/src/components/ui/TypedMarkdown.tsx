import React, { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomDark, dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "./button";
import { Icons } from "../icons";
import { toast } from "sonner";

interface TypedMarkdownInterface {
  chunks: string[];
}

const copyCode = (textToCopy: String) => {
  navigator.clipboard.writeText(String(textToCopy));
  toast.info("Code copied");
};

export const TypedMarkdown = ({ chunks }: TypedMarkdownInterface) => {
  const [currentText, setCurrentText] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunkIndex = useRef<number>(0);

  useEffect(() => {
    const typingSpeed = 40; // Adjust the typing speed here (in milliseconds)

    const streamText = () => {
      if (chunkIndex.current < chunks.length) {
        const nextChunk = chunks[chunkIndex.current];
        setCurrentText((prevText) => prevText + nextChunk);
        chunkIndex.current++;
      }
    };

    intervalRef.current = setInterval(streamText, typingSpeed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [chunks]);

  return (
    <Markdown
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        code(props) {
          const { children, className, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <div className="rounded-lg">
              <Button
                variant={"outline"}
                onClick={() => copyCode(String(children))}
                className="items-center justify-center"
              >
                <span className="mr-2">Copy</span>
                <Icons.Copy className="h-3 w-3" />
              </Button>

              <SyntaxHighlighter
                customStyle={{
                  borderRadius: "5px",
                  width: "100%",
                }}
                PreTag="div"
                children={String(children).replace(/\n$/, "")}
                language={match[1]}
                style={atomDark}
                wrapLongLines={true}
              />
            </div>
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {currentText}
    </Markdown>
  );
};
