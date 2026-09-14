import { Button } from "@/components/ui/button";
import { FileCheck2 } from "lucide-react";

export function EmptyState() {
  return (
    <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-border bg-surface-glass p-8 text-center">
      <div>
        <span className="mx-auto grid size-11 place-items-center rounded-xl bg-secondary text-primary">
          <FileCheck2 className="size-5" />
        </span>
        <h3 className="mt-4 text-sm font-semibold">No proof added yet</h3>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
          Add completed work to start building a verified record.
        </p>
        <Button size="sm" className="mt-4">Add proof</Button>
      </div>
    </div>
  );
}