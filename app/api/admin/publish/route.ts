import { NextResponse } from "next/server";
import { publishPortfolioData } from "@/utils/portfolioRepository";
import { readAdminSession } from "@/utils/adminSession";

export async function POST() {
  const session = await readAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await publishPortfolioData();

  return NextResponse.json({
    ok: true,
    source: result.source,
    publishedAt: result.record.publishedAt,
  });
}
