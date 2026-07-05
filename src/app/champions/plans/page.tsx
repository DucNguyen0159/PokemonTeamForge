import { redirect } from "next/navigation";

import { CHAMPIONS_BUILDER_PLANS_HREF } from "@/data/champions";

export default function ChampionsPlansPage() {
  redirect(CHAMPIONS_BUILDER_PLANS_HREF);
}
