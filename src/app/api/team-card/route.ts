import { errorResponse } from "@/lib/api/responses";

export async function GET() {
  return errorResponse(
    "NOT_IMPLEMENTED",
    "Team Card API scaffold is not available. Export runs in your browser.",
    501,
  );
}
