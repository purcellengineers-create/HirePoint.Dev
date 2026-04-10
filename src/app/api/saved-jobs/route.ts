import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await prisma.savedJob.findMany({
    where: { userId: (session.user as { id: string }).id },
    select: { id: true, jobId: true },
  });

  return NextResponse.json(saved);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await req.json();
  if (!jobId) {
    return NextResponse.json({ error: "Job ID required" }, { status: 400 });
  }

  const userId = (session.user as { id: string }).id;

  const existing = await prisma.savedJob.findUnique({
    where: { userId_jobId: { userId, jobId } },
  });
  if (existing) {
    return NextResponse.json(existing);
  }

  const saved = await prisma.savedJob.create({
    data: { userId, jobId },
  });

  return NextResponse.json(saved, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await req.json();
  if (!jobId) {
    return NextResponse.json({ error: "Job ID required" }, { status: 400 });
  }

  const userId = (session.user as { id: string }).id;

  await prisma.savedJob.deleteMany({
    where: { userId, jobId },
  });

  return NextResponse.json({ success: true });
}
