import { draftMode } from "next/headers";
import { PrintableCv } from "@/components/portfolio/PrintableCv";
import { getPublicPortfolioData } from "@/utils/portfolioRepository";

export const dynamic = "force-dynamic";

export default async function CvPage() {
  const { isEnabled } = await draftMode();
  const data = await getPublicPortfolioData(isEnabled);

  return <PrintableCv content={data.content} mode={data.mode} />;
}

