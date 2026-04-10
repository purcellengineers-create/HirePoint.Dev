import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeroSearch } from "@/components/hero-search";
import {
  formatSalary,
  formatJobType,
  formatRelativeDate,
  JOB_CATEGORIES,
} from "@/lib/format";
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Users,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featuredJobs, totalJobs, totalCompanies, totalSeekers, categoryCounts] =
    await Promise.all([
      prisma.job.findMany({
        where: { status: "OPEN" },
        include: { company: { select: { name: true, logo: true } } },
        orderBy: { postedAt: "desc" },
        take: 6,
      }),
      prisma.job.count({ where: { status: "OPEN" } }),
      prisma.company.count(),
      prisma.user.count({ where: { role: "JOB_SEEKER" } }),
      prisma.job.groupBy({
        by: ["category"],
        where: { status: "OPEN" },
        _count: { id: true },
      }),
    ]);

  const categoryMap = new Map(
    categoryCounts.map((c) => [c.category, c._count.id])
  );

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-background via-background to-muted">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />
        <div className="container relative mx-auto px-4 py-20 sm:py-28 lg:py-36 max-w-5xl text-center">
          <Badge variant="secondary" className="mb-4 text-xs font-medium px-3 py-1">
            <TrendingUp className="mr-1.5 h-3 w-3" />
            {totalJobs} open positions
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Find the career you{" "}
            <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              deserve
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Browse opportunities from top companies. Apply in seconds and track
            every step of your journey.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <HeroSearch />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Popular:</span>
            {["Engineering", "Design", "Marketing", "Data Science"].map((cat) => (
              <Link
                key={cat}
                href={`/jobs?category=${encodeURIComponent(cat)}`}
                className="rounded-full border bg-background px-3 py-1 text-xs font-medium transition-colors hover:bg-muted"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b">
        <div className="container mx-auto grid grid-cols-2 divide-x sm:grid-cols-3 max-w-4xl">
          {[
            { label: "Open Positions", value: totalJobs, icon: Briefcase },
            { label: "Companies", value: totalCompanies, icon: Building2 },
            { label: "Job Seekers", value: totalSeekers, icon: Users },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 py-8 sm:py-10"
            >
              <stat.icon className="h-5 w-5 text-muted-foreground mb-1" />
              <p className="text-3xl font-bold tracking-tight sm:text-4xl">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Latest Openings
            </h2>
            <p className="text-muted-foreground mt-1">
              Recently posted positions from top employers
            </p>
          </div>
          <Link
            href="/jobs"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {featuredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No open positions yet. Check back soon.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="group">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {job.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs shrink-0">
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
                      <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Badge variant="outline" className="text-xs font-normal">
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
        )}
      </section>

      {/* Categories */}
      <section className="border-t bg-muted/40">
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Browse by Category
            </h2>
            <p className="text-muted-foreground mt-1">
              Explore opportunities across industries
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {JOB_CATEGORIES.map((cat) => {
              const count = categoryMap.get(cat) ?? 0;
              return (
                <Link
                  key={cat}
                  href={`/jobs?category=${encodeURIComponent(cat)}`}
                  className="group flex items-center justify-between rounded-lg border bg-background p-4 transition-colors hover:bg-muted"
                >
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    {cat}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-20 max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to take the next step?
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Create your free account and start applying to jobs today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className={buttonVariants({ size: "lg" })}
            >
              Create Account
            </Link>
            <Link
              href="/jobs"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
