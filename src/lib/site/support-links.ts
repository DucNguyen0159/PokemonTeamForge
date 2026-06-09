type SupportUtmOptions = {
  source: string;
  medium: string;
  campaign: string;
};

export const SUPPORT_MONTHLY_TARGET_AMOUNT = 25;
export const SUPPORT_MONTHLY_TARGET_LABEL = `$${SUPPORT_MONTHLY_TARGET_AMOUNT}/mo target`;

export function buildTrackedSupportUrl(url: string, utm: SupportUtmOptions): string {
  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.set("utm_source", utm.source);
    parsed.searchParams.set("utm_medium", utm.medium);
    parsed.searchParams.set("utm_campaign", utm.campaign);
    return parsed.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}utm_source=${encodeURIComponent(utm.source)}&utm_medium=${encodeURIComponent(utm.medium)}&utm_campaign=${encodeURIComponent(utm.campaign)}`;
  }
}
