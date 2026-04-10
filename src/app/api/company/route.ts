import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const company = await prisma.company.findUnique({
    where: { ownerId: session.user.id },
  });

  if (!company) {
    return NextResponse.json(null);
  }

  return NextResponse.json({
    id: company.id,
    name: company.name,
    description: company.description,
    website: company.website,
    industry: company.industry,
    size: company.size,
    logo: company.logo,
  });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, description, website, industry, size } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    const company = await prisma.company.upsert({
      where: { ownerId: session.user.id },
      create: {
        ownerId: session.user.id,
        name: name.trim(),
        description: description || null,
        website: website || null,
        industry: industry || null,
        size: size || null,
      },
      update: {
        name: name.trim(),
        description: description || null,
        website: website || null,
        industry: industry || null,
        size: size || null,
      },
    });

    return NextResponse.json({
      id: company.id,
      name: company.name,
      description: company.description,
      website: company.website,
      industry: company.industry,
      size: company.size,
    });
  } catch (err) {
    console.error("Company update error:", err);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}
