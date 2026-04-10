import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true, company: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio,
    avatar: user.avatar,
    profile: user.profile
      ? {
          skills: JSON.parse(user.profile.skills),
          experience: user.profile.experience,
          location: user.profile.location,
          phone: user.profile.phone,
          resume: user.profile.resume,
        }
      : null,
    hasCompany: !!user.company,
  });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string | null;
    const bio = formData.get("bio") as string | null;
    const location = formData.get("location") as string | null;
    const skills = formData.get("skills") as string | null;
    const experience = formData.get("experience") as string | null;
    const phone = formData.get("phone") as string | null;
    const resumeFile = formData.get("resume") as File | null;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== null && { name }),
        ...(bio !== null && { bio }),
      },
    });

    if (session.user.role === "JOB_SEEKER") {
      let resumePath: string | undefined;

      if (resumeFile && resumeFile.size > 0) {
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });

        const ext = path.extname(resumeFile.name) || ".pdf";
        const filename = `${session.user.id}-${Date.now()}${ext}`;
        const filepath = path.join(uploadsDir, filename);
        const buffer = Buffer.from(await resumeFile.arrayBuffer());
        await writeFile(filepath, buffer);
        resumePath = `/uploads/${filename}`;
      }

      await prisma.profile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          ...(location !== null && { location }),
          ...(skills !== null && { skills }),
          ...(experience !== null && { experience }),
          ...(phone !== null && { phone }),
          ...(resumePath && { resume: resumePath }),
        },
        update: {
          ...(location !== null && { location }),
          ...(skills !== null && { skills }),
          ...(experience !== null && { experience }),
          ...(phone !== null && { phone }),
          ...(resumePath && { resume: resumePath }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
