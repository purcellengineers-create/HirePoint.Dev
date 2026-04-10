import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["PENDING", "REVIEWED", "INTERVIEW", "OFFERED", "REJECTED"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      job: {
        include: {
          company: { select: { id: true, name: true, ownerId: true } },
        },
      },
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
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const isApplicant = application.userId === session.user.id;
  const isCompanyOwner = application.job.company.ownerId === session.user.id;

  if (!isApplicant && !isCompanyOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(application);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      job: {
        include: {
          company: { select: { ownerId: true } },
        },
      },
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (application.job.company.ownerId !== session.user.id) {
    return NextResponse.json(
      { error: "You do not own this company" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { status } = body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const updated = await prisma.application.update({
    where: { id },
    data: { status },
  });

  const statusLabels: Record<string, string> = {
    REVIEWED: "reviewed",
    INTERVIEW: "moved to interview stage",
    OFFERED: "resulted in an offer",
    REJECTED: "been declined",
  };

  if (status !== "PENDING") {
    await prisma.notification.create({
      data: {
        userId: application.userId,
        type: "APPLICATION_UPDATE",
        message: `Your application for "${application.job.title}" has ${statusLabels[status] || "been updated"}`,
        link: `/dashboard/applications`,
      },
    });
  }

  return NextResponse.json(updated);
}
