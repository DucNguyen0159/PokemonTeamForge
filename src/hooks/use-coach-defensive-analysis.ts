"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  buildThreatChecklist,
  buildWeaknessMap,
  type TeamMemberInsight,
  type ThreatChecklistEntry,
  type WeaknessEntry,
} from "@/lib/champions/matchup-coach-analysis";

const EMPTY_WEAKNESS: WeaknessEntry[] = [];
const EMPTY_THREATS: ThreatChecklistEntry[] = [];

function insightsCacheKey(insights: TeamMemberInsight[]): string {
  return insights
    .map(
      (member) =>
        `${member.slot}:${member.name}:${member.types.join("+")}:${member.speedScore}`,
    )
    .join("|");
}

export function useCoachDefensiveAnalysis(memberInsights: TeamMemberInsight[]) {
  const cacheKey = useMemo(() => insightsCacheKey(memberInsights), [memberInsights]);
  const [weaknessMap, setWeaknessMap] = useState<WeaknessEntry[]>(EMPTY_WEAKNESS);
  const [threatChecklist, setThreatChecklist] = useState<ThreatChecklistEntry[]>(EMPTY_THREATS);
  const [isComputing, setIsComputing] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (memberInsights.length === 0) {
      setWeaknessMap(EMPTY_WEAKNESS);
      setThreatChecklist(EMPTY_THREATS);
      setIsComputing(false);
      return;
    }

    if (typeof Worker === "undefined") {
      setWeaknessMap(buildWeaknessMap(memberInsights));
      setThreatChecklist(buildThreatChecklist(memberInsights));
      setIsComputing(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsComputing(true);

    const worker = new Worker(
      new URL("../workers/matchup-coach-defensive.worker.ts", import.meta.url),
    );

    worker.onmessage = (event: MessageEvent<{ requestId: number; weaknessMap: WeaknessEntry[]; threatChecklist: ThreatChecklistEntry[] }>) => {
      if (event.data.requestId !== requestId) {
        return;
      }
      setWeaknessMap(event.data.weaknessMap);
      setThreatChecklist(event.data.threatChecklist);
      setIsComputing(false);
      worker.terminate();
    };

    worker.onerror = () => {
      if (requestIdRef.current !== requestId) {
        return;
      }
      setWeaknessMap(buildWeaknessMap(memberInsights));
      setThreatChecklist(buildThreatChecklist(memberInsights));
      setIsComputing(false);
      worker.terminate();
    };

    worker.postMessage({ requestId, memberInsights });

    return () => {
      worker.terminate();
    };
  }, [cacheKey, memberInsights]);

  return { weaknessMap, threatChecklist, isComputing };
}
