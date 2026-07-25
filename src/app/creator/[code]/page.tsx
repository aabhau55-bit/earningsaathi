import { CreatorStatsView } from "./creator-stats-view";

export default async function CreatorCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <CreatorStatsView code={code} />;
}
