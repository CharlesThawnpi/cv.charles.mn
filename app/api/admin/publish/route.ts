import { NextResponse } from "next/server";
import { publishPortfolioData } from "@/utils/portfolioRepository";
import { readAdminSession } from "@/utils/adminSession";

export async function POST() {
  const session = await readAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.info("[api/admin/publish] publish request received", {
    user: session.email,
  });

  try {
    const result = await publishPortfolioData();

    console.info("[api/admin/publish] publish request completed", {
      user: session.email,
      source: result.source,
      publishedAt: result.record.publishedAt,
    });

    return NextResponse.json({
      ok: true,
      source: result.source,
      publishedAt: result.record.publishedAt,
    });
  } catch (error) {
    console.error("[api/admin/publish] publish request failed", {
      user: session.email,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        error: "Publish failed. Check server logs for Firestore connectivity or permissions.",
      },
      { status: 500 }
    );
  }
}
