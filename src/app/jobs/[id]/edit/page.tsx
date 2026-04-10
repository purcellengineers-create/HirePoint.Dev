"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { JOB_CATEGORIES, JOB_TYPES, formatJobType } from "@/lib/format";
import { Loader2 } from "lucide-react";

interface JobData {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salaryMin: number | null;
  salaryMax: number | null;
  category: string;
  expiresAt: string | null;
  company: { ownerId: string };
}

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: session, status: authStatus } = useSession();
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setJob)
      .catch(() => toast.error("Job not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== "EMPLOYER") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          Only employers can edit jobs.
        </p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Job Not Found</h1>
      </div>
    );
  }

  if (job.company.ownerId !== session.user.id) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          You can only edit jobs from your own company.
        </p>
      </div>
    );
  }

  const expiresFormatted = job.expiresAt
    ? new Date(job.expiresAt).toISOString().split("T")[0]
    : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      location: form.get("location"),
      type: form.get("type"),
      salaryMin: form.get("salaryMin") || null,
      salaryMax: form.get("salaryMax") || null,
      category: form.get("category"),
      expiresAt: form.get("expiresAt") || null,
    };

    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update job");
      }

      toast.success("Job updated successfully");
      router.push("/dashboard/employer/jobs");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Job</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={job.title}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={job.description}
                rows={8}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={job.location}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Job Type</Label>
                <Select name="type" defaultValue={job.type}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {formatJobType(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Salary Min ($)</Label>
                <Input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  min="0"
                  defaultValue={job.salaryMin ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Salary Max ($)</Label>
                <Input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  min="0"
                  defaultValue={job.salaryMax ?? ""}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={job.category}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiry Date</Label>
                <Input
                  id="expiresAt"
                  name="expiresAt"
                  type="date"
                  defaultValue={expiresFormatted}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
