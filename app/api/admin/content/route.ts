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

  try {
    const data = await getAdminPortfolioData();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("[api/admin/content] failed to load admin content", {
      user: session.email,
      error: message,
    });

    return NextResponse.json({ error: `Unable to load admin content: ${message}` }, { status: 500 });
  }
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

  try {
    const result = await saveDraftPortfolioData(body);

    return NextResponse.json({
      ok: true,
      source: result.source,
      updatedAt: result.record.updatedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("[api/admin/content] failed to save draft", {
      user: session.email,
      error: message,
    });

    return NextResponse.json(
      { error: `Save failed: ${message}` },
      { status: 500 }
    );
  }
}

