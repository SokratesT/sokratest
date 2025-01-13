import { clientEnv } from "@/lib/env/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const response = await fetch(`${clientEnv.NEXT_PUBLIC_CHAT_API}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if the response is a stream
    const contentType = response.headers.get("Content-Type");

    // TODO: Implement checking for the content type
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 },
    );
  }
}
