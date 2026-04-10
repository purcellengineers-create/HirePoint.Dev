import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const type = searchParams.get("type");
  const location = searchParams.get("location");
  const salaryMin = searchParams.get("salaryMin");
  const salaryMax = searchParams.get("salaryMax");
  const category = searchParams.get("category");
  const datePosted = searchParams.get("datePosted");
  const status = searchParams.get("status") || "OPEN";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "12", 10)));

  const where: Record<string, unknown> = { status };

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { company: { name: { contains: q } } },
    ];
  }

  if (type) {
    const types = type.split(",").filter(Boolean);
    if (types.length > 0) {
      where.type = { in: types };
    }
  }

  if (location) {
    where.location = { contains: location };
  }

  if (salaryMin) {
    where.salaryMax = { gte: parseInt(salaryMin, 10) };
  }

  if (salaryMax) {
    where.salaryMin = { lte: parseInt(salaryMax, 10) };
  }

  if (category) {
    where.category = category;
  }

  if (datePosted) {
    const now = new Date();
    let dateFrom: Date;
    switch (datePosted) {
      case "24h":
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFrom = new Date(0);
    }
    where.postedAt = { gte: dateFrom };
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, logo: true, industry: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { postedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({
    jobs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const company = await prisma.company.findUnique({
    where: { ownerId: session.user.id },
  });
  if (!company) {
    return NextResponse.json(
      { error: "No company profile found" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { title, description, location, type, salaryMin, salaryMax, category, expiresAt } = body;

  if (!title || !description || !location || !type || !category) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      title,
      description,
      location,
      type,
      salaryMin: salaryMin ? parseInt(salaryMin, 10) : null,
      salaryMax: salaryMax ? parseInt(salaryMax, 10) : null,
      category,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json(job, { status: 201 });
}
