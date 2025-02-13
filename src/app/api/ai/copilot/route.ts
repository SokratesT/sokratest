import { customModel } from "@/lib/ai";
import { generateText } from "ai";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { model = "gpt-4o-mini", prompt, system } = await req.json();

  try {
    const result = await generateText({
      abortSignal: req.signal,
      maxTokens: 50,
      model: customModel({
        model: {
          id: "llama3.1",
          label: "Llama 3.1",
          apiIdentifier: "llama3.1:latest",
          description: "Local Llama",
        },
        mode: "local",
      }),
      prompt: prompt,
      system,
      temperature: 0.7,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json(null, { status: 408 });
    }

    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 },
    );
  }
}
