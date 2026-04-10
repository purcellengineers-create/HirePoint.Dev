import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { JOB_CATEGORIES } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const jobCounts = await prisma.job.groupBy({
    by: ["category"],
    where: { status: "OPEN" },
    _count: { id: true },
  });

  const countMap = new Map(
    jobCounts.map((j) => [j.category, j._count.id])
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Job Categories</h1>
        <p className="text-muted-foreground mt-1">
          Browse open positions by category
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {JOB_CATEGORIES.map((category) => {
          const count = countMap.get(category) || 0;
          return (
            <Link
              key={category}
              href={`/jobs?category=${encodeURIComponent(category)}`}
            >
              <Card className="h-full transition-shadow hover:shadow-md group">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>
                      {count} open position{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
