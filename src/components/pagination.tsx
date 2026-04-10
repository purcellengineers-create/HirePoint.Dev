"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages: (number | "dots")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("dots");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("dots");
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, i) =>
        page === "dots" ? (
          <span
            key={`dots-${i}`}
            className="px-2 text-sm text-muted-foreground select-none"
          >
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => goToPage(page)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
