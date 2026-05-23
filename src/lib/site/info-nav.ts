export const INFO_PAGE_LINKS = [
  { href: "/help", label: "Help" },
  { href: "/about", label: "About" },
  { href: "/credits", label: "Credits" },
  { href: "/contact", label: "Contact" },
  { href: "/support", label: "Support" },
] as const;

export const INFO_LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export const INFO_FOOTER_LINKS = [
  ...INFO_PAGE_LINKS,
  ...INFO_LEGAL_LINKS,
] as const;
