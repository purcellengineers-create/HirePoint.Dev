"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Building2, Loader2, CheckCircle2 } from "lucide-react";

interface JobInfo {
  id: string;
  title: string;
  company: { name: string };
  status: string;
}

export default function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [jobId, setJobId] = useState<string>("");
  const [job, setJob] = useState<JobInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [useProfileResume, setUseProfileResume] = useState(false);
  const [profileResume, setProfileResume] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setJobId(p.id));
  }, [params]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (!jobId || authStatus !== "authenticated") return;

    async function load() {
      try {
        const [jobRes, appsRes, profileRes] = await Promise.all([
          fetch(`/api/jobs/${jobId}`),
          fetch(`/api/applications`),
          fetch(`/api/profile`),
        ]);

        if (!jobRes.ok) {
          toast.error("Job not found");
          router.push("/jobs");
          return;
        }

        const jobData = await jobRes.json();
        setJob(jobData);

        if (appsRes.ok) {
          const apps = await appsRes.json();
          const existing = Array.isArray(apps)
            ? apps.find(
                (a: { jobId: string }) => a.jobId === jobId
              )
            : null;
          if (existing) setAlreadyApplied(true);
        }

        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (profile?.resume) setProfileResume(profile.resume);
        }
      } catch {
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [jobId, authStatus, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const finalResume = useProfileResume ? profileResume : resumeUrl;

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          coverLetter: coverLetter || null,
          resumeUrl: finalResume || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit application");
      }

      toast.success("Application submitted successfully");
      router.push("/dashboard/applications");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit application"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (session?.user?.role !== "JOB_SEEKER") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          Only job seekers can apply to jobs.
        </p>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Link
        href={`/jobs/${jobId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to job
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Apply for Position</h1>
        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
          <span className="text-lg font-medium text-foreground">{job.title}</span>
          <span className="text-sm">at</span>
          <span className="flex items-center gap-1.5 text-sm">
            <Building2 className="h-4 w-4" />
            {job.company.name}
          </span>
        </div>
      </div>

      {alreadyApplied ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Already Applied</h2>
            <p className="text-muted-foreground mb-6">
              You have already submitted an application for this position.
            </p>
            <Link
              href="/dashboard/applications"
              className={buttonVariants({ variant: "outline" })}
            >
              View Your Applications
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="coverLetter">Cover Letter</Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Tell the employer why you're a great fit for this role..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="min-h-[160px]"
                />
              </div>

              <div className="space-y-3">
                <Label>Resume</Label>
                {profileResume && (
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useProfileResume}
                      onChange={(e) => {
                        setUseProfileResume(e.target.checked);
                        if (e.target.checked) setResumeUrl("");
                      }}
                      className="rounded border-input"
                    />
                    Use resume from my profile
                  </label>
                )}
                {!useProfileResume && (
                  <Input
                    type="url"
                    placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                  />
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Application
                </Button>
                <Link
                  href={`/jobs/${jobId}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Cancel
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
