import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatRelativeDate } from "@/lib/format";
import {
  Briefcase,
  Users,
  TrendingUp,
  Plus,
  ListChecks,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EmployerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "EMPLOYER") redirect("/dashboard");

  const userId = (session.user as { id: string }).id;

  const company = await prisma.company.findUnique({
    where: { ownerId: userId },
    select: { id: true },
  });

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-5xl text-center">
        <h1 className="text-2xl font-bold">Set up your company first</h1>
        <p className="text-muted-foreground mt-2">
          Create a company profile to start posting jobs.
        </p>
        <Link
          href="/company/edit"
          className={buttonVariants({ className: "mt-6" })}
        >
          Create Company Profile
        </Link>
      </div>
    );
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [activeListings, totalApplicants, newToday, recentApplications] =
    await Promise.all([
      prisma.job.count({
        where: { companyId: company.id, status: "OPEN" },
      }),
      prisma.application.count({
        where: { job: { companyId: company.id } },
      }),
      prisma.application.count({
        where: {
          job: { companyId: company.id },
          appliedAt: { gte: oneDayAgo },
        },
      }),
      prisma.application.findMany({
        where: { job: { companyId: company.id } },
        include: {
          user: { select: { name: true, email: true } },
          job: { select: { id: true, title: true } },
        },
        orderBy: { appliedAt: "desc" },
        take: 5,
      }),
    ]);

  const stats = [
    { label: "Active Listings", value: activeListings, icon: Briefcase },
    { label: "Total Applicants", value: totalApplicants, icon: Users },
    { label: "New Today", value: newToday, icon: TrendingUp },
  ];

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Employer Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, {session.user.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 pt-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <s.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applicants */}
      <Card className="mb-8">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Applicants</CardTitle>
          <Link
            href="/dashboard/employer/jobs"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentApplications.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Users className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">
                No applicants yet. Share your job listings to attract candidates.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {app.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Applied to {app.job.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <StatusBadge status={app.status} />
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {formatRelativeDate(app.appliedAt)}
                    </span>
                    <Link
                      href={`/dashboard/employer/jobs/${app.job.id}/applicants`}
                      className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: "/jobs/post", label: "Post New Job", desc: "Create a listing", icon: Plus },
          { href: "/dashboard/employer/jobs", label: "Manage Listings", desc: `${activeListings} active`, icon: ListChecks },
          { href: "/dashboard/employer/jobs", label: "View All Applicants", desc: `${totalApplicants} total`, icon: Users },
        ].map((link) => (
          <Link key={link.label} href={link.href} className="group">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 pt-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                  <link.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {link.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
