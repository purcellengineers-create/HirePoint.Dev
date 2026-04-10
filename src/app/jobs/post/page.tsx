"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { JOB_CATEGORIES, JOB_TYPES, formatJobType } from "@/lib/format";
import { Loader2 } from "lucide-react";

export default function PostJobPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [submitting, setSubmitting] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== "EMPLOYER") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          Only employers can post jobs.
        </p>
      </div>
    );
  }

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
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create job");
      }

      toast.success("Job posted successfully");
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
          <CardTitle className="text-2xl">Post a New Job</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the role, responsibilities, and requirements..."
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
                  placeholder="e.g. San Francisco, CA"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Job Type</Label>
                <Select name="type" required defaultValue="FULL_TIME">
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
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
                  placeholder="e.g. 80000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Salary Max ($)</Label>
                <Input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  min="0"
                  placeholder="e.g. 120000"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
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
                <Input id="expiresAt" name="expiresAt" type="date" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Post Job
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
