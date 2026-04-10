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
  Send,
  CalendarCheck,
  Gift,
  Bookmark,
  Briefcase,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SeekerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role === "EMPLOYER") redirect("/dashboard/employer");

  const userId = (session.user as { id: string }).id;

  const [applications, savedCount] = await Promise.all([
    prisma.application.findMany({
      where: { userId },
      include: {
        job: {
          include: { company: { select: { name: true } } },
        },
      },
      orderBy: { appliedAt: "desc" },
    }),
    prisma.savedJob.count({ where: { userId } }),
  ]);

  const total = applications.length;
  const interviews = applications.filter((a) => a.status === "INTERVIEW").length;
  const offers = applications.filter((a) => a.status === "OFFERED").length;
  const recent = applications.slice(0, 5);

  const stats = [
    { label: "Applications Sent", value: total, icon: Send },
    { label: "Interviews", value: interviews, icon: CalendarCheck },
    { label: "Offers", value: offers, icon: Gift },
    { label: "Saved Jobs", value: savedCount, icon: Bookmark },
  ];

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, {session.user.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Recent Applications */}
      <Card className="mb-8">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Applications</CardTitle>
          <Link
            href="/dashboard/applications"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">
                No applications yet. Start exploring open positions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/jobs/${app.job.id}`}
                      className="text-sm font-medium hover:underline truncate block"
                    >
                      {app.job.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {app.job.company.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <StatusBadge status={app.status} />
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {formatRelativeDate(app.appliedAt)}
                    </span>
                    <Link
                      href={`/jobs/${app.job.id}`}
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
          { href: "/jobs", label: "Browse Jobs", desc: "Explore open positions", icon: Briefcase },
          { href: "/dashboard/saved", label: "Saved Jobs", desc: `${savedCount} saved`, icon: Bookmark },
          { href: "/dashboard/applications", label: "My Applications", desc: `${total} submitted`, icon: Send },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="group">
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
