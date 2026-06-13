import type { Route } from "./+types/settings.ai";
import { Form, Link } from "react-router";
import { requireSession } from "~/lib/auth.server";
import { aiSettings } from "~/lib/ai/settings.server";
import {
  redactAiSettings,
  DEFAULT_LANGUAGE_MODEL,
  type LanguageProvider,
  type TranscriptionProviderId,
} from "~/lib/ai/settings";
import { resolveModelProvider } from "~/lib/ai/model";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const selectClass =
  "border-input bg-transparent h-9 w-full rounded-md border px-3 text-sm";

export async function loader(args: Route.LoaderArgs) {
  const { orgId, role } = await requireSession(args);
  if (role !== "admin") throw new Response("Forbidden", { status: 403 });
  return { redacted: redactAiSettings(await aiSettings.get(orgId)) };
}

export async function action(args: Route.ActionArgs) {
  const { orgId, role } = await requireSession(args);
  if (role !== "admin") throw new Response("Forbidden", { status: 403 });

  const form = await args.request.formData();
  const intent = form.get("intent");
  const current = await aiSettings.get(orgId);
  const str = (k: string) => String(form.get(k) ?? "").trim();

  if (intent === "save") {
    const next = { ...current };

    // Keep the existing key when the field is left blank (keys are never
    // shown back to the client).
    const lKey = str("languageApiKey") || current.languageModel?.apiKey;
    if (lKey) {
      next.languageModel = {
        provider: str("languageProvider") as LanguageProvider,
        apiKey: lKey,
        model: str("languageModel") || DEFAULT_LANGUAGE_MODEL,
      };
    }
    const tKey = str("transcriptionApiKey") || current.transcription?.apiKey;
    if (tKey) {
      next.transcription = {
        provider: str("transcriptionProvider") as TranscriptionProviderId,
        apiKey: tKey,
      };
    }
    await aiSettings.save(orgId, next);
    return { message: "Saved." };
  }

  if (intent === "test") {
    try {
      const reply = await resolveModelProvider(current).complete(
        "Reply with exactly the word: ok",
      );
      return { message: `Success — model replied: "${reply.slice(0, 80)}"` };
    } catch (e) {
      return { message: `Failed: ${e instanceof Error ? e.message : String(e)}` };
    }
  }

  throw new Response("Unknown intent", { status: 400 });
}

export default function AiSettings({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { redacted } = loaderData;
  const lm = redacted.languageModel;
  const tr = redacted.transcription;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <Link to="/truths" className="text-sm text-muted-foreground">
        ← Corpus
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">AI providers</h1>
      <p className="mt-2 text-muted-foreground">
        RunOil is model-agnostic — your organization brings its own provider
        keys. Defaults to xAI Grok (one key covers extraction and transcription).
      </p>

      {actionData?.message && (
        <p className="mt-4 rounded-md border bg-muted/40 px-3 py-2 text-sm">
          {actionData.message}
        </p>
      )}

      <Form method="post" className="mt-6 flex flex-col gap-8">
        <fieldset className="grid gap-4 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">
            Language model (extraction, reconciliation, synthesis)
          </legend>
          <div className="grid gap-1.5">
            <Label htmlFor="languageProvider">Provider</Label>
            <select
              id="languageProvider"
              name="languageProvider"
              className={selectClass}
              defaultValue={lm?.provider ?? "xai"}
            >
              <option value="xai">xAI (Grok)</option>
              <option value="anthropic">Anthropic (Claude) — coming soon</option>
              <option value="openai">OpenAI (GPT) — coming soon</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="languageModel">Model</Label>
            <Input
              id="languageModel"
              name="languageModel"
              defaultValue={lm?.model ?? DEFAULT_LANGUAGE_MODEL}
              placeholder="grok-4"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="languageApiKey">
              API key {lm?.configured && "(configured — leave blank to keep)"}
            </Label>
            <Input
              id="languageApiKey"
              name="languageApiKey"
              type="password"
              placeholder={lm?.configured ? "••••••••" : "xai-…"}
              autoComplete="off"
            />
          </div>
        </fieldset>

        <fieldset className="grid gap-4 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">
            Transcription (audio → text)
          </legend>
          <div className="grid gap-1.5">
            <Label htmlFor="transcriptionProvider">Provider</Label>
            <select
              id="transcriptionProvider"
              name="transcriptionProvider"
              className={selectClass}
              defaultValue={tr?.provider ?? "xai"}
            >
              <option value="xai">xAI (Grok STT)</option>
              <option value="openai">OpenAI (Whisper) — coming soon</option>
              <option value="deepgram">Deepgram — coming soon</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="transcriptionApiKey">
              API key {tr?.configured && "(configured — leave blank to keep)"}
            </Label>
            <Input
              id="transcriptionApiKey"
              name="transcriptionApiKey"
              type="password"
              placeholder={tr?.configured ? "••••••••" : "xai-…"}
              autoComplete="off"
            />
          </div>
        </fieldset>

        <div className="flex gap-3">
          <Button type="submit" name="intent" value="save">
            Save
          </Button>
          <Button type="submit" name="intent" value="test" variant="secondary">
            Test language model
          </Button>
        </div>
      </Form>
    </div>
  );
}
