import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const unreadCount = req.nextUrl.searchParams.get("unreadCount");

  if (unreadCount === "true") {
    const count = await prisma.notification.count({
      where: { userId, read: false },
    });
    return NextResponse.json({ count });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notifications);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  if (body.all === true) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  }

  if (Array.isArray(body.ids) && body.ids.length > 0) {
    await prisma.notification.updateMany({
      where: { id: { in: body.ids }, userId },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid body" }, { status: 400 });
}
