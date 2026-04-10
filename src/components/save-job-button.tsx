"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SaveJobButtonProps {
  jobId: string;
  isSaved: boolean;
  className?: string;
}

export function SaveJobButton({
  jobId,
  isSaved: initialSaved,
  className,
}: SaveJobButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const prev = saved;
    setSaved(!prev);

    try {
      const res = await fetch("/api/saved-jobs", {
        method: prev ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) setSaved(prev);
    } catch {
      setSaved(prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      disabled={loading}
      className={cn("shrink-0", className)}
      aria-label={saved ? "Unsave job" : "Save job"}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          saved ? "fill-red-500 text-red-500" : "text-muted-foreground"
        )}
      />
    </Button>
  );
}
