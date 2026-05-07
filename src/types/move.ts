export interface Move {
  id: string;
  name: string;
  type: string;
  category: "physical" | "special" | "status";
}
