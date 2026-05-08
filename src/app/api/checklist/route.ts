import { errorResponse } from "@/lib/api/responses";

export async function GET() {
  return errorResponse(
    "NOT_IMPLEMENTED",
    "Checklist API scaffold is not available yet.",
    501,
  );
}
