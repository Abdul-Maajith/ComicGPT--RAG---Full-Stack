import { Button } from "@/components/ui/button";
import { ExternalLink } from "./external-link";

export interface EmptyScreenProps {
  onExampleClick: (query: string) => Promise<void>;
}

export function EmptyScreen({ onExampleClick }: EmptyScreenProps) {
  const exampleMessages = [
    {
      heading: "Who is the",
      subheading: "most powerful Avenger?",
      message: "Who is the most powerful Avenger?",
    },
    {
      heading: "What is the origin of",
      subheading: "Spider-Man's powers?",
      message: "What is the origin of Spider-Man's powers?",
    },
    {
      heading: "What is the",
      subheading: "real name of Batman?",
      message: "What is the real name of Batman?",
    },
    {
      heading: "What are the",
      subheading: "superpowers of Superman?",
      message: "What are the superpowers of Superman?",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 mt-5">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">Welcome to ComicGPT!</h1>
        <p className="leading-normal text-muted-foreground">
          This is an open source AI chatbot about Marvel Movies and DC
          Characters{" "}
          <ExternalLink href="https://marvelcinematicuniverse.fandom.com/wiki/Marvel_Cinematic_Universe_Wiki">
            Marvel Universe
          </ExternalLink>
          , the{" "}
          <ExternalLink href="https://dc.fandom.com/wiki/DC_Comics_Database">
            DC Universe
          </ExternalLink>
          .
        </p>
        <p className="leading-normal text-muted-foreground">
          Whether you're a longtime comic book fan or new to the superhero
          world, ComicGPT is here to enhance your knowledge and excitement about
          these fantastic universes.You can ask anything about Marvel and DC
          Characters
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 mt-2 gap-2">
        {exampleMessages.map((example, index) => (
          <div
            key={example.heading}
            className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${
              index > 1 && "hidden md:block"
            }`}
            onClick={(e) => {
              e.preventDefault();
              onExampleClick(example.message);
            }}
          >
            <div className="text-sm font-semibold">{example.heading}</div>
            <div className="text-sm text-zinc-600">{example.subheading}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
