import { generateText } from "ai";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSaiaModel } from "@/lib/ai/saia-models";

export async function POST(req: NextRequest) {
  const { prompt, instructions } = await req.json();

  try {
    const result = await generateText({
      abortSignal: req.signal,
      maxOutputTokens: 50,
      model: getSaiaModel({
        input: ["text"],
        model: "meta-llama-3.1-8b-instruct",
      }).provider,
      prompt,
      instructions,
      temperature: 0.7,
      telemetry: { isEnabled: false },
    });

    return NextResponse.json({ text: result.text });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(null, { status: 408 });
    }

    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 },
    );
  }
}
