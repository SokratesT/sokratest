"use server";

export const testAction = async () => {
  console.log("Test Action");
  const res = await fetch("http://localhost:8000/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: "Hello",
        },
      ],
    }),
  });

  console.log(JSON.stringify(res));
};
