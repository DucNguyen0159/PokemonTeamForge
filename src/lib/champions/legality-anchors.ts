import type { ChampionsLegalityIssue } from "@/lib/champions/legality";

export type LegalityAnchor =
  | { kind: "slot"; slot: number; field?: "sp" | "item" | "ability" | "moves" }
  | { kind: "team"; field: "name" }
  | { kind: "plan"; planName: string }
  | { kind: "unknown" };

function extractSlot(message: string): number | null {
  const match = message.match(/Slot (\d+)/);
  return match ? Number(match[1]) : null;
}

export function getLegalityAnchor(issue: ChampionsLegalityIssue): LegalityAnchor {
  const slot = extractSlot(issue.message);
  if (slot) {
    if (issue.message.includes("SP limit") || issue.message.includes("unallocated SP")) {
      return { kind: "slot", slot, field: "sp" };
    }
    if (issue.message.includes("Mega Stone") || issue.message.includes("Duplicate item")) {
      return { kind: "slot", slot, field: "item" };
    }
    if (issue.message.includes("no ability")) {
      return { kind: "slot", slot, field: "ability" };
    }
    if (issue.message.includes("no moves")) {
      return { kind: "slot", slot, field: "moves" };
    }
    if (issue.message.includes("Duplicate species")) {
      return { kind: "slot", slot };
    }
    return { kind: "slot", slot };
  }

  if (issue.message.includes("Team name")) {
    return { kind: "team", field: "name" };
  }

  const planMatch = issue.message.match(/^([^:]+):/);
  if (planMatch) {
    return { kind: "plan", planName: planMatch[1].trim() };
  }

  return { kind: "unknown" };
}

export function getFirstIssueForSlot(
  issues: ChampionsLegalityIssue[],
  slot: number,
): ChampionsLegalityIssue | null {
  return (
    issues.find((issue) => {
      const anchor = getLegalityAnchor(issue);
      return anchor.kind === "slot" && anchor.slot === slot;
    }) ?? null
  );
}

export function slotHasLegalityError(
  issues: ChampionsLegalityIssue[],
  slot: number,
): boolean {
  return issues.some((issue) => {
    if (issue.severity !== "error") {
      return false;
    }
    const anchor = getLegalityAnchor(issue);
    return anchor.kind === "slot" && anchor.slot === slot;
  });
}

export type SlotFieldError = "sp" | "item" | "ability" | "moves";

export function getSlotFieldErrors(
  issues: ChampionsLegalityIssue[],
  slot: number,
): Set<SlotFieldError> {
  const fields = new Set<SlotFieldError>();
  issues.forEach((issue) => {
    const anchor = getLegalityAnchor(issue);
    if (anchor.kind === "slot" && anchor.slot === slot && anchor.field) {
      fields.add(anchor.field);
    }
  });
  return fields;
}
