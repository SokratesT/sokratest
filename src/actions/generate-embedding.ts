"use server";

export const generateEmbedding = async (url: string) => {
  console.log("Test Action");
  const res = await fetch("http://localhost:8000/api/generate/single", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: url,
        },
      ],
    }),
  });

  const embedding = await res.json();

  return embedding;
};
