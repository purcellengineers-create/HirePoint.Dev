import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-muted text-muted-foreground",
  },
  REVIEWED: {
    label: "Reviewed",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  INTERVIEW: {
    label: "Interview",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  OFFERED: {
    label: "Offered",
    className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "",
  };

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-medium", config.className)}
    >
      {config.label}
    </Badge>
  );
}
