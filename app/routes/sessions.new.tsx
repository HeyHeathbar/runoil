import type { Route } from "./+types/sessions.new";
import { Form, Link, redirect } from "react-router";
import { requireSession } from "~/lib/auth.server";
import { sessions } from "~/lib/sessions.server";
import { aiSettings } from "~/lib/ai/settings.server";
import { resolveTranscriptionProvider } from "~/lib/ai/transcription";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

export async function loader(args: Route.LoaderArgs) {
  const { orgId } = await requireSession(args);
  const settings = await aiSettings.get(orgId);
  return { transcriptionConfigured: Boolean(settings.transcription) };
}

export async function action(args: Route.ActionArgs) {
  const { orgId } = await requireSession(args);
  const form = await args.request.formData();
  const title = String(form.get("title") ?? "").trim() || "Untitled session";
  const audio = form.get("audio");
  const pasted = String(form.get("transcript") ?? "").trim();

  try {
    let transcript: string;
    let source: "paste" | "audio";

    if (audio instanceof File && audio.size > 0) {
      const provider = resolveTranscriptionProvider(await aiSettings.get(orgId));
      transcript = await provider.transcribe(audio, audio.name);
      source = "audio";
    } else if (pasted) {
      transcript = pasted;
      source = "paste";
    } else {
      return { error: "Paste a transcript or choose an audio file." };
    }

    const session = await sessions.create(orgId, { title, source, transcript });
    return redirect(`/sessions/${session.id}`);
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

export default function NewSession({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <Link to="/sessions" className="text-sm text-muted-foreground">
        ← The Guide
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">New session</h1>

      {actionData?.error && (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
          {actionData.error}
        </p>
      )}

      <Form
        method="post"
        encType="multipart/form-data"
        className="mt-6 flex flex-col gap-6"
      >
        <div className="grid gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="Ops interview — fulfillment" />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="transcript">Paste a transcript</Label>
          <Textarea
            id="transcript"
            name="transcript"
            rows={10}
            placeholder="Paste meeting/interview text here…"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="audio">…or upload audio</Label>
          <input
            id="audio"
            name="audio"
            type="file"
            accept="audio/*"
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {loaderData.transcriptionConfigured
              ? "Transcribed via your configured provider."
              : "Configure a transcription provider in Settings → AI to enable audio."}
          </p>
        </div>

        <div className="flex gap-3">
          <Button type="submit">Create session</Button>
          <Button asChild variant="ghost">
            <Link to="/sessions">Cancel</Link>
          </Button>
        </div>
      </Form>
    </div>
  );
}
