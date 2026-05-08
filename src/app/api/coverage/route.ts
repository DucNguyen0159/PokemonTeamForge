import { errorResponse } from "@/lib/api/responses";

export async function GET() {
  return errorResponse(
    "NOT_IMPLEMENTED",
    "Coverage API scaffold is not available yet.",
    501,
  );
}
