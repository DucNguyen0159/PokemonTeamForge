export function formatSlug(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}
