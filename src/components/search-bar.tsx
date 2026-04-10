"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paramsRef = useRef(searchParams);

  useEffect(() => {
    paramsRef.current = searchParams;
    setValue(searchParams.get("q") || "");
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(paramsRef.current.toString());
      if (newValue) {
        params.set("q", newValue);
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search jobs by title, description, or company..."
        value={value}
        onChange={handleChange}
        className="pl-9 h-10"
      />
    </div>
  );
}
