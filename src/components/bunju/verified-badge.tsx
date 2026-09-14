import { Badge } from "@/components/ui/badge";
import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ children = "Verified" }: { children?: React.ReactNode }) {
  return (
    <Badge variant="verified" className="gap-1 rounded-full">
      <BadgeCheck className="size-3.5" />
      {children}
    </Badge>
  );
}