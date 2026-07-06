import { NextRequest, NextResponse } from "next/server";

import { getApiBaseUrl } from "@/lib/api-base-url";
import { getAccessToken } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return new NextResponse(null, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date");
  const query = date ? `?date=${encodeURIComponent(date)}` : "";

  let response: Response;
  try {
    const apiBaseUrl = getApiBaseUrl();
    response = await fetch(`${apiBaseUrl}/api/v1/reports/daily/export${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error && error.message
            ? `Impossible de joindre le backend FastAPI. Vérifie API_BASE_URL dans Coolify. Détail: ${error.message}`
            : "Impossible de joindre le backend FastAPI. Vérifie API_BASE_URL dans Coolify.",
      },
      { status: 503 }
    );
  }

  if (!response.ok) {
    return new NextResponse(null, { status: response.status });
  }

  const body = await response.text();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": response.headers.get("content-disposition") ?? "attachment; filename=rapport.csv",
    },
  });
}
