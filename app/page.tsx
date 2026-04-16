import { draftMode } from "next/headers";
import { PortfolioHome } from "@/components/portfolio/PortfolioHome";
import { getPublicPortfolioData } from "@/utils/portfolioRepository";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function HomePage() {
  const { isEnabled } = await draftMode();
  const data = await getPublicPortfolioData(isEnabled);

  return <PortfolioHome content={data.content} source={data.source} mode={data.mode} />;
}

