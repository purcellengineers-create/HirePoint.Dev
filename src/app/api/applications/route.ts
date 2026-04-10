import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "JOB_SEEKER") {
    const applications = await prisma.application.findMany({
      where: { userId: session.user.id },
      include: {
        job: {
          include: {
            company: { select: { id: true, name: true, logo: true } },
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });
    return NextResponse.json(applications);
  }

  if (session.user.role === "EMPLOYER") {
    const company = await prisma.company.findUnique({
      where: { ownerId: session.user.id },
    });
    if (!company) {
      return NextResponse.json([]);
    }
    const applications = await prisma.application.findMany({
      where: { job: { companyId: company.id } },
      include: {
        job: { select: { id: true, title: true } },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            profile: true,
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });
    return NextResponse.json(applications);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "JOB_SEEKER") {
    return NextResponse.json(
      { error: "Only job seekers can apply" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { jobId, coverLetter, resumeUrl } = body;

  if (!jobId) {
    return NextResponse.json(
      { error: "Job ID is required" },
      { status: 400 }
    );
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { company: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status !== "OPEN") {
    return NextResponse.json(
      { error: "This job is no longer accepting applications" },
      { status: 400 }
    );
  }

  const existing = await prisma.application.findUnique({
    where: { jobId_userId: { jobId, userId: session.user.id } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You have already applied to this job" },
      { status: 409 }
    );
  }

  const application = await prisma.application.create({
    data: {
      jobId,
      userId: session.user.id,
      coverLetter: coverLetter || null,
      resumeUrl: resumeUrl || null,
    },
  });

  await prisma.notification.create({
    data: {
      userId: job.company.ownerId,
      type: "NEW_APPLICATION",
      message: `New application received for "${job.title}" from ${session.user.name}`,
      link: `/dashboard/employer/jobs/${job.id}/applicants`,
    },
  });

  return NextResponse.json(application, { status: 201 });
}
