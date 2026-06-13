import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "RunOil" },
    { name: "description", content: "The Atomic Truth Engine." },
  ];
}

export default function Home() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        The Atomic Truth Engine
      </h1>
      <p className="text-muted-foreground">
        RunOil captures your organization's real operating truth, governs it,
        and publishes it into the AI tools you already use. Sign in to begin.
      </p>
      <div>
        <Button>Get started</Button>
      </div>
    </div>
  );
}
