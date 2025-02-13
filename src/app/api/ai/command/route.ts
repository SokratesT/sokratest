import { customModel } from "@/lib/ai";
import { convertToCoreMessages, streamText } from "ai";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, model = "gpt-4o-mini", system } = await req.json();

  try {
    const result = streamText({
      maxTokens: 2048,
      messages: convertToCoreMessages(messages),
      model: customModel({
        model: {
          id: "llama3.1",
          label: "Llama 3.1",
          apiIdentifier: "llama3.1:latest",
          description: "Local Llama",
        },
        mode: "local",
      }),
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
