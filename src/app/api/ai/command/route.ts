import { getModel } from "@/lib/ai/models";
import { convertToCoreMessages, streamText } from "ai";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, model = "gpt-4o-mini", system } = await req.json();

  try {
    const result = streamText({
      maxTokens: 2048,
      messages: convertToCoreMessages(messages),
      model: getModel({ type: "small" }),
      system: system,
    });

    return result.toDataStreamResponse();
  } catch {
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 },
    );
  }
}
