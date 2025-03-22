import { embed } from "ai";
import { getModel } from "./models";

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\\n", " ");
  const { embedding } = await embed({
    model: getModel({ type: "embedding" }),
    value: input,
  });

  return embedding;
};
