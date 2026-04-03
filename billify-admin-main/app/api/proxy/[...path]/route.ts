import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getBackendBaseUrls() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";

  if (configuredBaseUrl) {
    return [configuredBaseUrl.replace(/\/+$/, "")];
  }

  throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
}

function buildProxyResponse(response: Response, body: BodyInit | null) {
  const responseHeaders = new Headers(response.headers);

  responseHeaders.delete("content-length");
  responseHeaders.delete("content-encoding");

  return new NextResponse(body, {
    status: response.status,
    headers: responseHeaders,
  });
}

function shouldRetryWithNextBackend(response: Response, bodyText: string) {
  const contentType = response.headers.get("content-type") || "";

  return response.status === 404 && contentType.includes("text/html") && bodyText.includes("Cannot GET");
}

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const backendBaseUrls = getBackendBaseUrls();
    const headers = new Headers(request.headers);

    headers.delete("host");
    headers.delete("connection");
    headers.delete("origin");
    headers.delete("referer");

    const bodyBuffer =
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.arrayBuffer()
        : undefined;

    let lastResponse: Response | null = null;

    for (const backendBaseUrl of backendBaseUrls) {
      const targetUrl = new URL(`${backendBaseUrl}/${path.join("/")}`);

      targetUrl.search = request.nextUrl.search;

      const init: RequestInit = {
        method: request.method,
        headers: new Headers(headers),
        cache: "no-store",
      };

      if (bodyBuffer) {
        init.body = bodyBuffer.slice(0);
      }

      const response = await fetch(targetUrl, init);
      lastResponse = response;

      if (response.ok || response.status !== 404) {
        return buildProxyResponse(response, response.body);
      }

      const bodyText = await response.text();
      if (!shouldRetryWithNextBackend(response, bodyText)) {
        return buildProxyResponse(response, bodyText);
      }
    }

    if (lastResponse) {
      return buildProxyResponse(lastResponse, lastResponse.body);
    }

    throw new Error("No backend response received");
  } catch {
    return NextResponse.json(
      {
        message: "Backend API is unreachable or NEXT_PUBLIC_API_BASE_URL is not configured.",
      },
      { status: 502 },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = handler;