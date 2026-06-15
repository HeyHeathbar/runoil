import { Link } from "react-router";
import type { ReceiptView } from "~/lib/cockpit/receipt";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

// A single Truth-mode "receipt": the governed Atomic Truth an answer was grounded
// in, with its reality gap and provenance shown. Presentational — see toReceiptView.
export function ReceiptCard({ receipt }: { receipt: ReceiptView }) {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{receipt.statement}</CardTitle>
          <div className="flex shrink-0 gap-1.5">
            {receipt.conflict && <Badge variant="destructive">conflict</Badge>}
            <Badge variant="secondary">{receipt.type}</Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {receipt.status}
          {receipt.owner ? ` · owner: ${receipt.owner}` : ""}
        </p>
      </CardHeader>

      {receipt.gap && (
        <CardContent>
          <div className="rounded-lg border bg-muted/30 p-3 text-xs">
            <div className="mb-1.5 font-medium">
              Reality gap · severity {receipt.gap.severity}
            </div>
            <dl className="grid gap-2">
              {receipt.gap.stated && (
                <div>
                  <dt className="text-muted-foreground">Stated</dt>
                  <dd>{receipt.gap.stated}</dd>
                </div>
              )}
              {receipt.gap.actual && (
                <div>
                  <dt className="text-muted-foreground">Actual</dt>
                  <dd>{receipt.gap.actual}</dd>
                </div>
              )}
              {receipt.gap.documented && (
                <div>
                  <dt className="text-muted-foreground">Documented</dt>
                  <dd>{receipt.gap.documented}</dd>
                </div>
              )}
            </dl>
          </div>
        </CardContent>
      )}

      {receipt.quote && (
        <CardContent>
          <blockquote className="border-l-2 pl-3 text-xs text-muted-foreground italic">
            &ldquo;{receipt.quote}&rdquo;
          </blockquote>
        </CardContent>
      )}

      <CardContent>
        <Link to={receipt.href} className="text-xs text-primary underline-offset-4 hover:underline">
          Open in Corpus →
        </Link>
      </CardContent>
    </Card>
  );
}
