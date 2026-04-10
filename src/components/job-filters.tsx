"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { JOB_CATEGORIES, JOB_TYPES, formatJobType } from "@/lib/format";
import { SlidersHorizontal, X } from "lucide-react";

export function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedTypes =
    searchParams.get("type")?.split(",").filter(Boolean) || [];
  const location = searchParams.get("location") || "";
  const salaryMin = searchParams.get("salaryMin") || "";
  const salaryMax = searchParams.get("salaryMax") || "";
  const category = searchParams.get("category") || "";
  const datePosted = searchParams.get("datePosted") || "";

  const hasFilters =
    selectedTypes.length > 0 ||
    location ||
    salaryMin ||
    salaryMax ||
    category ||
    datePosted;

  const activeCount = [
    selectedTypes.length > 0,
    !!location,
    !!salaryMin || !!salaryMax,
    !!category,
    !!datePosted,
  ].filter(Boolean).length;

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearFilters = () => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleType = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    updateParams({ type: newTypes.length > 0 ? newTypes.join(",") : null });
  };

  const filterContent = (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Job Type</Label>
        {JOB_TYPES.map((type) => (
          <div key={type} className="flex items-center gap-2">
            <Checkbox
              id={`type-${type}`}
              checked={selectedTypes.includes(type)}
              onCheckedChange={() => toggleType(type)}
            />
            <span
              className="text-sm cursor-pointer select-none"
              onClick={() => toggleType(type)}
            >
              {formatJobType(type)}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Location</Label>
        <Input
          key={`loc-${location}`}
          placeholder="City, state, or remote"
          defaultValue={location}
          onBlur={(e) =>
            updateParams({ location: e.target.value || null })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParams({
                location: (e.target as HTMLInputElement).value || null,
              });
            }
          }}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Salary Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            key={`smin-${salaryMin}`}
            type="number"
            placeholder="Min"
            defaultValue={salaryMin}
            onBlur={(e) =>
              updateParams({ salaryMin: e.target.value || null })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({
                  salaryMin: (e.target as HTMLInputElement).value || null,
                });
              }
            }}
          />
          <Input
            key={`smax-${salaryMax}`}
            type="number"
            placeholder="Max"
            defaultValue={salaryMax}
            onBlur={(e) =>
              updateParams({ salaryMax: e.target.value || null })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({
                  salaryMax: (e.target as HTMLInputElement).value || null,
                });
              }
            }}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Category</Label>
        <Select
          value={category || "all"}
          onValueChange={(val) =>
            updateParams({ category: val === "all" ? null : (val as string) })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {JOB_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Date Posted</Label>
        {[
          { value: "", label: "Any time" },
          { value: "24h", label: "Last 24 hours" },
          { value: "week", label: "Last week" },
          { value: "month", label: "Last month" },
        ].map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name="datePosted"
              checked={datePosted === option.value}
              onChange={() =>
                updateParams({ datePosted: option.value || null })
              }
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>

      {hasFilters && (
        <>
          <Separator />
          <Button variant="outline" onClick={clearFilters} className="w-full">
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        </>
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          {filterContent}
        </div>
      </aside>

      <div className="lg:hidden mb-4">
        <Sheet>
          <SheetTrigger
            render={<Button variant="outline" size="sm" />}
          >
            <SlidersHorizontal className="h-4 w-4 mr-1.5" />
            Filters
            {activeCount > 0 && (
              <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {activeCount}
              </span>
            )}
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4">{filterContent}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
