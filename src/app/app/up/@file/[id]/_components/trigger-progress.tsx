import type { helloWorldTask } from "@/trigger/example";
import { useRealtimeRun } from "@trigger.dev/react-hooks";

export function TriggerProgress({
  runId,
  publicAccessToken,
}: {
  runId: string;
  publicAccessToken: string;
}) {
  const { run, error } = useRealtimeRun<typeof helloWorldTask>(runId, {
    accessToken: publicAccessToken,
    baseURL: "http://localhost:3040",
  });

  if (error) return <div>Error: {error.message}</div>;

  // Now run.payload and run.output are correctly typed

  if (!run) return <div>No Run</div>;

  return <div>Run: {run.status}</div>;
}
