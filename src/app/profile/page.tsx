"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  X,
  Upload,
  FileText,
  Building2,
  ArrowRight,
} from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string | null;
  profile: {
    skills: string[];
    experience: string | null;
    location: string | null;
    phone: string | null;
    resume: string | null;
  } | null;
  hasCompany: boolean;
}

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead / Staff" },
  { value: "executive", label: "Executive" },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [experience, setExperience] = useState("");
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [hasCompany, setHasCompany] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error();
      const data: ProfileData = await res.json();

      setName(data.name);
      setEmail(data.email);
      setBio(data.bio || "");
      setRole(data.role);
      setHasCompany(data.hasCompany);

      if (data.profile) {
        setSkills(data.profile.skills || []);
        setExperience(data.profile.experience || "");
        setLocation(data.profile.location || "");
        setPhone(data.profile.phone || "");
        setResumeUrl(data.profile.resume);
      }
    } catch {
      toast.error("Failed to load profile");
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
      fetchProfile();
    }
  }, [status, router, fetchProfile]);

  function addSkill(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const value = skillInput.trim().toLowerCase();
    if (!value || skills.includes(value)) {
      setSkillInput("");
      return;
    }
    setSkills((prev) => [...prev, value]);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("bio", bio);

      if (role === "JOB_SEEKER") {
        formData.append("location", location);
        formData.append("phone", phone);
        formData.append("skills", JSON.stringify(skills));
        formData.append("experience", experience);
        if (resumeFile) {
          formData.append("resume", resumeFile);
        }
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      toast.success("Profile updated");
      if (resumeFile) {
        setResumeFile(null);
        fetchProfile();
      }
    } catch {
      toast.error("Failed to save changes");
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
      <h1 className="mb-6 text-2xl font-bold">Edit Profile</h1>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {role === "JOB_SEEKER" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Experience level</Label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setExperience(level.value)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                        experience === level.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  placeholder="Type a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                />
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="cursor-pointer gap-1 pr-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="rounded-full p-0.5 hover:bg-foreground/10"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label>Resume</Label>
                {resumeUrl && !resumeFile && (
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-medium text-primary hover:underline"
                    >
                      Current resume
                    </a>
                  </div>
                )}
                <label
                  htmlFor="resume"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  <Upload className="h-4 w-4" />
                  {resumeFile ? resumeFile.name : "Upload new resume (PDF, DOC)"}
                </label>
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {role === "EMPLOYER" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Company</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href="/company/edit"
                className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {hasCompany
                    ? "Edit company profile"
                    : "Set up your company profile"}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
