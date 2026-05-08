import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
    },
    { status },
  );
}

export function errorResponse<T = never>(
  code: string,
  message: string,
  status: number,
) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status },
  );
}
