import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { TRUTH_TYPES, type AtomicTruth } from "~/lib/corpus/truth";
import { CONFIDENCES, SEVERITIES } from "~/lib/truth-form";

const selectClass =
  "border-input bg-transparent h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

// Native selects (not Radix) so the form posts plain values without extra JS.
export function TruthFields({ truth }: { truth?: AtomicTruth }) {
  const gap = truth?.realityGap;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-1.5">
        <Label htmlFor="statement">Statement</Label>
        <Input
          id="statement"
          name="statement"
          required
          defaultValue={truth?.statement}
          placeholder="Orders ship within 48h of payment"
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          defaultValue={truth?.description}
          placeholder="Short summary of the concept"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            className={selectClass}
            defaultValue={truth?.type ?? "Process"}
          >
            {TRUTH_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="confidence">Confidence</Label>
          <select
            id="confidence"
            name="confidence"
            className={selectClass}
            defaultValue={truth?.confidence ?? "single-source"}
          >
            {CONFIDENCES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="owner">Owner</Label>
        <Input
          id="owner"
          name="owner"
          defaultValue={truth?.owner}
          placeholder="Accountable person or role"
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          name="tags"
          defaultValue={truth?.tags.join(", ")}
          placeholder="order-to-cash, fulfillment"
        />
      </div>

      <fieldset className="grid gap-4 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">
          Reality gap — stated vs. actual vs. documented
        </legend>
        <div className="grid gap-1.5">
          <Label htmlFor="stated">Stated (what leadership says)</Label>
          <Input id="stated" name="stated" defaultValue={gap?.stated} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="actual">Actual (what staff live)</Label>
          <Input id="actual" name="actual" defaultValue={gap?.actual} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="documented">Documented (what files claim)</Label>
          <Input
            id="documented"
            name="documented"
            defaultValue={gap?.documented}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="severity">Severity</Label>
          <select
            id="severity"
            name="severity"
            className={selectClass}
            defaultValue={gap?.severity ?? "none"}
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <div className="grid gap-1.5">
        <Label htmlFor="body">Notes &amp; provenance (markdown)</Label>
        <Textarea
          id="body"
          name="body"
          rows={6}
          defaultValue={truth?.body}
          placeholder="Source quotes, context, related links…"
        />
      </div>
    </div>
  );
}
