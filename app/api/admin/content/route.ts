import { NextResponse } from "next/server";
import {
  getAdminPortfolioData,
  saveDraftPortfolioData,
} from "@/utils/portfolioRepository";
import { readAdminSession } from "@/utils/adminSession";

const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export async function GET() {
  const session = await readAdminSession();

  if (!session) {
    return unauthorized();
  }

  const data = await getAdminPortfolioData();
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const session = await readAdminSession();

  if (!session) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const result = await saveDraftPortfolioData(body);

  return NextResponse.json({
    ok: true,
    source: result.source,
    updatedAt: result.record.updatedAt,
  });
}

