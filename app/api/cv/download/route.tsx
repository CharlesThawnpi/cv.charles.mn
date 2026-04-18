import { draftMode } from "next/headers";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { CvPdfDocument } from "@/components/pdf/CvPdfDocument";
import {
  CANONICAL_PORTFOLIO_URL,
  formatDisplayUrl,
  preparePublicPortfolioContent,
} from "@/utils/publicContent";
import { getPublicPortfolioData } from "@/utils/portfolioRepository";

export const dynamic = "force-dynamic";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function GET() {
  try {
    const { isEnabled } = await draftMode();
    const { content } = await getPublicPortfolioData(isEnabled);
    const publicContent = preparePublicPortfolioContent(content);
    const portfolioUrl = publicContent.cv.portfolioUrl?.trim() || CANONICAL_PORTFOLIO_URL;
    const displayPortfolioUrl = formatDisplayUrl(portfolioUrl);

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
        content={publicContent}
        portfolioUrl={portfolioUrl}
        displayPortfolioUrl={displayPortfolioUrl}
        qrCodeDataUrl={qrCodeDataUrl}
      />
    );
    const fileName = `${toSlug(publicContent.profile.name || "charles")}-cv.pdf`;
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
