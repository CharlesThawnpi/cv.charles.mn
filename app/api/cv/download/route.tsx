import { draftMode } from "next/headers";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { CvPdfDocument } from "@/components/pdf/CvPdfDocument";
import { getPublicPortfolioData } from "@/utils/portfolioRepository";

export const dynamic = "force-dynamic";

const FALLBACK_PORTFOLIO_URL = "https://cv-charles-mn.vercel.app";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function GET() {
  try {
    const { isEnabled } = await draftMode();
    const { content } = await getPublicPortfolioData(isEnabled);
    const portfolioUrl =
      content.cv.portfolioUrl?.trim() ||
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      FALLBACK_PORTFOLIO_URL;

    const qrCodeDataUrl = await QRCode.toDataURL(portfolioUrl, {
      margin: 1,
      width: 180,
      color: {
        dark: "#173f67",
        light: "#0000",
      },
    });

    const pdfBuffer = await renderToBuffer(
      <CvPdfDocument
        content={content}
        portfolioUrl={portfolioUrl}
        qrCodeDataUrl={qrCodeDataUrl}
      />
    );
    const fileName = `${toSlug(content.profile.name || "charles")}-cv.pdf`;
    const pdfBytes = new Uint8Array(pdfBuffer);

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("[api/cv/download] failed to generate PDF", { error: message });

    return Response.json(
      { error: `Unable to generate PDF: ${message}` },
      { status: 500 }
    );
  }
}
