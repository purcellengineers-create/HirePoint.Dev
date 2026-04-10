export function formatSalary(min?: number | null, max?: number | null): string {
  if (!min && !max) return "Not specified";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  if (diffWeek < 5) return `${diffWeek} week${diffWeek !== 1 ? "s" : ""} ago`;
  if (diffMonth < 12)
    return `${diffMonth} month${diffMonth !== 1 ? "s" : ""} ago`;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatJobType(type: string): string {
  const map: Record<string, string> = {
    FULL_TIME: "Full Time",
    PART_TIME: "Part Time",
    CONTRACT: "Contract",
    REMOTE: "Remote",
  };
  return map[type] || type;
}

export const JOB_CATEGORIES = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Finance",
  "Operations",
  "Product",
  "Data Science",
  "DevOps",
  "Customer Support",
  "Human Resources",
  "Legal",
] as const;

export const JOB_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "REMOTE",
] as const;
