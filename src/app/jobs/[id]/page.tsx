import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { formatSalary, formatRelativeDate, formatJobType } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Globe,
  Users,
  Briefcase,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!job) notFound();

  const session = await getServerSession(authOptions);
  const applyHref = session?.user ? `/jobs/${job.id}/apply` : "/login";

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
              <Badge variant="secondary">{formatJobType(job.type)}</Badge>
              {job.status !== "OPEN" && (
                <Badge variant="destructive">{job.status}</Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {job.company.name}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Posted {formatRelativeDate(job.postedAt)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Salary</p>
                <p className="font-medium">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-medium">{job.category}</p>
              </div>
            </div>
            {job.expiresAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Expires</p>
                  <p className="font-medium">
                    {new Date(job.expiresAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="prose prose-neutral max-w-none dark:prose-invert">
            <h2 className="text-xl font-semibold mb-3">Job Description</h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {job.description}
            </div>
          </div>

          <div className="pt-4">
            <Link href={applyHref} className={buttonVariants({ size: "lg" })}>
              Apply Now
            </Link>
          </div>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">About the Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                  {job.company.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{job.company.name}</p>
                  {job.company.industry && (
                    <p className="text-xs text-muted-foreground">
                      {job.company.industry}
                    </p>
                  )}
                </div>
              </div>

              {job.company.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {job.company.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                {job.company.size && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{job.company.size} employees</span>
                  </div>
                )}
                {job.company.website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {job.company.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
