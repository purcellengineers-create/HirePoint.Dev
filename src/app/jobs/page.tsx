import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { formatSalary, formatRelativeDate, formatJobType } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
} from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { JobFilters } from "@/components/job-filters";
import { Pagination } from "@/components/pagination";
import { SaveJobButton } from "@/components/save-job-button";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function param(val: string | string[] | undefined): string {
  return typeof val === "string" ? val : "";
}

export default async function JobsPage({ searchParams }: Props) {
  const sp = await searchParams;

  const q = param(sp.q);
  const type = param(sp.type);
  const location = param(sp.location);
  const salaryMin = param(sp.salaryMin);
  const salaryMax = param(sp.salaryMax);
  const category = param(sp.category);
  const datePosted = param(sp.datePosted);
  const page = Math.max(1, parseInt(param(sp.page) || "1", 10) || 1);

  const where: Record<string, unknown> = { status: "OPEN" };

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { company: { name: { contains: q } } },
    ];
  }

  if (type) {
    const types = type.split(",").filter(Boolean);
    if (types.length > 0) where.type = { in: types };
  }

  if (location) {
    where.location = { contains: location };
  }

  if (salaryMin) {
    where.salaryMax = { gte: parseInt(salaryMin, 10) };
  }

  if (salaryMax) {
    where.salaryMin = { lte: parseInt(salaryMax, 10) };
  }

  if (category) {
    where.category = category;
  }

  if (datePosted) {
    const now = new Date();
    let dateFrom: Date;
    switch (datePosted) {
      case "24h":
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFrom = new Date(0);
    }
    where.postedAt = { gte: dateFrom };
  }

  const session = await getServerSession(authOptions);

  const [jobs, total, savedJobIds] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: { select: { name: true, logo: true, industry: true } },
      },
      orderBy: { postedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.job.count({ where }),
    session?.user
      ? prisma.savedJob
          .findMany({
            where: { userId: (session.user as { id: string }).id },
            select: { jobId: true },
          })
          .then((saved) => new Set(saved.map((s) => s.jobId)))
      : Promise.resolve(new Set<string>()),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Job Listings</h1>
        <p className="text-muted-foreground mt-1">
          {total} open position{total !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="mb-6">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <Suspense>
          <JobFilters />
        </Suspense>

        <div className="flex-1 min-w-0">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  No jobs match your criteria
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Try adjusting your filters or search terms.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {jobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="group">
                    <Card className="h-full transition-shadow hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {job.title}
                          </CardTitle>
                          <SaveJobButton
                            jobId={job.id}
                            isSaved={savedJobIds.has(job.id)}
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-xs"
                          >
                            {formatJobType(job.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{job.company.name}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <DollarSign className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {job.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatRelativeDate(job.postedAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              <Suspense>
                <Pagination currentPage={page} totalPages={totalPages} />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
