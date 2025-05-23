import { getSaiaModel } from "@/lib/ai/saia-models";
import { convertToCoreMessages, streamText } from "ai";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, model = "gpt-4o-mini", system } = await req.json();

  try {
    const result = streamText({
      maxTokens: 2048,
      messages: convertToCoreMessages(messages),
      model: getSaiaModel({
        input: ["text"],
        model: "meta-llama-3.1-8b-instruct",
      }).provider,
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
