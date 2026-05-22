import { redirect } from "next/navigation";

/** No standalone page — type chart opens as an overlay (FAB) on Pokédex, Builder, and detail. */
export default function TypeChartPage() {
  redirect("/pokedex");
}
