"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Media",
  "Consulting",
  "Real Estate",
  "Other",
];

const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

export default function CompanyEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");

  const fetchCompany = useCallback(async () => {
    try {
      const res = await fetch("/api/company");
      if (!res.ok) throw new Error();
      const data = await res.json();

      if (data) {
        setIsNew(false);
        setName(data.name || "");
        setDescription(data.description || "");
        setWebsite(data.website || "");
        setIndustry(data.industry || "");
        setSize(data.size || "");
      }
    } catch {
      toast.error("Failed to load company data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      if (session?.user?.role !== "EMPLOYER") {
        toast.error("Only employers can manage company profiles");
        router.push("/profile");
        return;
      }
      fetchCompany();
    }
  }, [status, session, router, fetchCompany]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Company name is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description,
          website,
          industry,
          size,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      toast.success(isNew ? "Company profile created" : "Company profile updated");
      setIsNew(false);
    } catch {
      toast.error("Failed to save company profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">
        {isNew ? "Create Company Profile" : "Edit Company Profile"}
      </h1>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>
              This information will be visible on your job postings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company name *</Label>
              <Input
                id="companyName"
                placeholder="Acme Inc."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What does your company do?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="industry">Industry</Label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="size">Company size</Label>
                <select
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s} employees
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/profile")}>
            Back to profile
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isNew ? "Create company" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
