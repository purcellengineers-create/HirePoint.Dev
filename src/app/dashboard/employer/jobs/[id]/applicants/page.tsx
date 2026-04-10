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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { formatRelativeDate } from "@/lib/format";
import { ArrowLeft, FileText, Eye } from "lucide-react";

interface Applicant {
  id: string;
  userId: string;
  jobId: string;
  coverLetter: string | null;
  resumeUrl: string | null;
  status: string;
  appliedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    profile: {
      resume: string | null;
      skills: string;
      experience: string | null;
      location: string | null;
      phone: string | null;
    } | null;
  };
}

interface JobInfo {
  id: string;
  title: string;
}

const STATUSES = ["PENDING", "REVIEWED", "INTERVIEW", "OFFERED", "REJECTED"];

export default function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status: authStatus } = useSession();
  const [jobId, setJobId] = useState("");
  const [job, setJob] = useState<JobInfo | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setJobId(p.id));
  }, [params]);

  const fetchData = useCallback(async () => {
    if (!jobId) return;
    try {
      const [jobRes, appsRes] = await Promise.all([
        fetch(`/api/jobs/${jobId}`),
        fetch("/api/applications"),
      ]);

      if (jobRes.ok) {
        const jobData = await jobRes.json();
        setJob({ id: jobData.id, title: jobData.title });
      }

      if (appsRes.ok) {
        const allApps: Applicant[] = await appsRes.json();
        setApplicants(allApps.filter((a) => a.jobId === jobId));
      }
    } catch {
      toast.error("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (authStatus === "authenticated" && jobId) fetchData();
  }, [authStatus, jobId, fetchData]);

  async function updateStatus(applicationId: string, newStatus: string) {
    setUpdatingId(applicationId);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      toast.success(`Status updated to ${newStatus}`);
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicationId ? { ...a, status: newStatus } : a
        )
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-6xl space-y-4">
        <Skeleton className="h-6 w-32" />
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
          Only employers can view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <Link
        href="/dashboard/employer/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Applicants{job ? `: ${job.title}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {applicants.length} applicant{applicants.length !== 1 ? "s" : ""}
        </p>
      </div>

      <Card>
        <CardHeader className="sr-only">
          <CardTitle>Applicants Table</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {applicants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">
                No applications received yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cover Letter</TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applicants.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      <ApplicantDialog applicant={app} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {app.user.email}
                    </TableCell>
                    <TableCell className="max-w-[200px] text-sm text-muted-foreground">
                      {app.coverLetter ? (
                        <span className="truncate block">
                          {app.coverLetter.length > 60
                            ? `${app.coverLetter.slice(0, 60)}...`
                            : app.coverLetter}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {app.resumeUrl ? (
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
                      ) : (
                        <span className="text-sm text-muted-foreground/50">
                          None
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatRelativeDate(app.appliedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={app.status}
                        onValueChange={(val) => val && updateStatus(app.id, val)}
                        disabled={updatingId === app.id}
                      >
                        <SelectTrigger size="sm" className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.charAt(0) + s.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

function ApplicantDialog({ applicant }: { applicant: Applicant }) {
  const skills = (() => {
    try {
      return JSON.parse(applicant.user.profile?.skills || "[]") as string[];
    } catch {
      return [];
    }
  })();

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center gap-1.5 hover:underline cursor-pointer text-left font-medium">
        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
        {applicant.user.name}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{applicant.user.name}</DialogTitle>
          <DialogDescription>{applicant.user.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {applicant.user.bio && (
            <div>
              <p className="font-medium text-xs text-muted-foreground mb-1">
                Bio
              </p>
              <p>{applicant.user.bio}</p>
            </div>
          )}

          {applicant.user.profile?.location && (
            <div>
              <p className="font-medium text-xs text-muted-foreground mb-1">
                Location
              </p>
              <p>{applicant.user.profile.location}</p>
            </div>
          )}

          {applicant.user.profile?.phone && (
            <div>
              <p className="font-medium text-xs text-muted-foreground mb-1">
                Phone
              </p>
              <p>{applicant.user.profile.phone}</p>
            </div>
          )}

          {skills.length > 0 && (
            <div>
              <p className="font-medium text-xs text-muted-foreground mb-1">
                Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {applicant.user.profile?.experience && (
            <div>
              <p className="font-medium text-xs text-muted-foreground mb-1">
                Experience
              </p>
              <p className="whitespace-pre-wrap">
                {applicant.user.profile.experience}
              </p>
            </div>
          )}

          {applicant.coverLetter && (
            <div>
              <p className="font-medium text-xs text-muted-foreground mb-1">
                Cover Letter
              </p>
              <p className="whitespace-pre-wrap">{applicant.coverLetter}</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <StatusBadge status={applicant.status} />
            <span className="text-xs text-muted-foreground">
              Applied {formatRelativeDate(applicant.appliedAt)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
