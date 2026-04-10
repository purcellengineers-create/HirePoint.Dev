"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelativeDate } from "@/lib/format";
import { Plus, Pencil, XCircle, Loader2 } from "lucide-react";

interface JobRow {
  id: string;
  title: string;
  status: string;
  postedAt: string;
  _count: { applications: number };
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  OPEN: "default",
  CLOSED: "destructive",
  DRAFT: "secondary",
};

export default function EmployerJobsPage() {
  const { data: session, status: authStatus } = useSession();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const [open, closed, draft] = await Promise.all(
        ["OPEN", "CLOSED", "DRAFT"].map((s) =>
          fetch(`/api/jobs?status=${s}`).then((r) => r.json())
        )
      );
      setJobs([...open, ...closed, ...draft]);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") fetchJobs();
  }, [authStatus, fetchJobs]);

  async function closeJob(id: string) {
    setClosingId(id);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Job closed");
      fetchJobs();
    } catch {
      toast.error("Failed to close job");
    } finally {
      setClosingId(null);
    }
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-5xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== "EMPLOYER") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          Only employers can access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Jobs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} posted
          </p>
        </div>
        <Link href="/jobs/post" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          Post New Job
        </Link>
      </div>

      <Card>
        <CardHeader className="sr-only">
          <CardTitle>Jobs Table</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">
                You haven&apos;t posted any jobs yet.
              </p>
              <Link
                href="/jobs/post"
                className={buttonVariants({ variant: "outline", className: "mt-4" })}
              >
                Post your first job
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Applications</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium max-w-[250px] truncate">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="hover:underline"
                      >
                        {job.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[job.status] || "outline"}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {job._count.applications}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatRelativeDate(job.postedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/jobs/${job.id}/edit`}
                          className={buttonVariants({ variant: "ghost", size: "sm" })}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        {job.status === "OPEN" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => closeJob(job.id)}
                            disabled={closingId === job.id}
                          >
                            {closingId === job.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </Button>
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
