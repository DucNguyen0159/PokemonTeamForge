import {
  buildThreatChecklist,
  buildWeaknessMap,
  type TeamMemberInsight,
} from "@/lib/champions/matchup-coach-analysis";

type WorkerRequest = {
  requestId: number;
  memberInsights: TeamMemberInsight[];
};

type WorkerResponse = {
  requestId: number;
  weaknessMap: ReturnType<typeof buildWeaknessMap>;
  threatChecklist: ReturnType<typeof buildThreatChecklist>;
};

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { requestId, memberInsights } = event.data;
  const weaknessMap = buildWeaknessMap(memberInsights);
  const threatChecklist = buildThreatChecklist(memberInsights);
  const response: WorkerResponse = { requestId, weaknessMap, threatChecklist };
  self.postMessage(response);
};
