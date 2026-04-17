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
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("[api/admin/publish] publish request failed", {
      user: session.email,
      error: message,
    });

    return NextResponse.json(
      {
        error: `Publish failed: ${message}`,
      },
      { status: 500 }
    );
  }
}
