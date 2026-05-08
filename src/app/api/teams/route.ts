import { errorResponse } from "@/lib/api/responses";

export async function GET() {
  return errorResponse(
    "NOT_IMPLEMENTED",
    "Direct Team API route is not available. Please use the profile team actions.",
    501,
  );
}
