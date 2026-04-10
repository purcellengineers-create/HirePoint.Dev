"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/jobs?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/jobs");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Job title, keyword, or company..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-11"
        />
      </div>
      <Button type="submit" size="lg">
        Search
      </Button>
    </form>
  );
}
