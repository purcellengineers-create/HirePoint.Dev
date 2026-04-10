import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { formatSalary, formatRelativeDate, formatJobType } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Heart,
} from "lucide-react";
import { SaveJobButton } from "@/components/save-job-button";

export const dynamic = "force-dynamic";

export default async function SavedJobsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const savedJobs = await prisma.savedJob.findMany({
    where: { userId },
    include: {
      job: {
        include: {
          company: { select: { name: true, logo: true, industry: true } },
        },
      },
    },
    orderBy: { id: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
        <p className="text-muted-foreground mt-1">
          {savedJobs.length} saved job{savedJobs.length !== 1 ? "s" : ""}
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No saved jobs yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Save jobs you&apos;re interested in to find them here later.
            </p>
            <Link
              href="/jobs"
              className="mt-4 text-sm text-primary underline underline-offset-4"
            >
              Browse jobs
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedJobs.map(({ job }) => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="group">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {job.title}
                    </CardTitle>
                    <SaveJobButton jobId={job.id} isSaved={true} />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="shrink-0 text-xs">
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
    </div>
  );
}
