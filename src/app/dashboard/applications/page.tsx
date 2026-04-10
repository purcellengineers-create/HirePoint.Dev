"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { formatRelativeDate } from "@/lib/format";
import { ExternalLink, FileText } from "lucide-react";

interface ApplicationRow {
  id: string;
  jobId: string;
  status: string;
  coverLetter: string | null;
  resumeUrl: string | null;
  appliedAt: string;
  job: {
    id: string;
    title: string;
    company: {
      id: string;
      name: string;
    };
  };
}

export default function ApplicationsDashboard() {
  const { data: session, status: authStatus } = useSession();
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/applications");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setApplications(data);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") fetchApplications();
  }, [authStatus, fetchApplications]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-5xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== "JOB_SEEKER") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          Only job seekers can view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Your Applications</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {applications.length} application{applications.length !== 1 ? "s" : ""} submitted
        </p>
      </div>

      <Card>
        <CardHeader className="sr-only">
          <CardTitle>Applications Table</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">
                You haven&apos;t applied to any jobs yet.
              </p>
              <Link
                href="/jobs"
                className={buttonVariants({
                  variant: "outline",
                  className: "mt-4",
                })}
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium max-w-[250px] truncate">
                      <Link
                        href={`/jobs/${app.job.id}`}
                        className="hover:underline"
                      >
                        {app.job.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {app.job.company.name}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatRelativeDate(app.appliedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/jobs/${app.job.id}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "sm",
                          })}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        {app.resumeUrl && (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonVariants({
                              variant: "ghost",
                              size: "sm",
                            })}
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
