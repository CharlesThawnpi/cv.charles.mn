import { draftMode } from "next/headers";
import { PortfolioHome } from "@/components/portfolio/PortfolioHome";
import { preparePublicPortfolioContent } from "@/utils/publicContent";
import { getPublicPortfolioData } from "@/utils/portfolioRepository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { isEnabled } = await draftMode();
  const data = await getPublicPortfolioData(isEnabled);
  const content = preparePublicPortfolioContent(data.content);

  return <PortfolioHome content={content} source={data.source} mode={data.mode} />;
}

