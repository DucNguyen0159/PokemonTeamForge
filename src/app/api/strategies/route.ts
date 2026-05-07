import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "not_implemented",
    message: "This endpoint is part of the initial scaffold.",
  });
}
