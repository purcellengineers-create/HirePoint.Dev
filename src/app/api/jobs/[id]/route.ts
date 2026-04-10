import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.company.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, location, type, salaryMin, salaryMax, category, expiresAt, status } = body;

  const updated = await prisma.job.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(location && { location }),
      ...(type && { type }),
      ...(category && { category }),
      ...(status && { status }),
      salaryMin: salaryMin !== undefined ? (salaryMin ? parseInt(salaryMin, 10) : null) : undefined,
      salaryMax: salaryMax !== undefined ? (salaryMax ? parseInt(salaryMax, 10) : null) : undefined,
      expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
    },
  });

  return NextResponse.json(updated);
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

  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.company.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { status } = body;

  if (!status || !["OPEN", "CLOSED", "DRAFT"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.job.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.company.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.job.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
