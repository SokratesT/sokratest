import { z } from "zod";

const email = z.email({
  error: "Invalid email address.",
});

const username = z
  .string()
  .min(3, {
    error: "Username must be at least 3 characters.",
  })
  .nullish();

const password = z.string().min(8, {
  error: "Password must be at least 8 characters.",
});

const name = z
  .string()
  .min(3, {
    error: "Name must be at least 3 characters.",
  })
  .max(100, {
    error: "Name must be at most 100 characters.",
  });

export const sharedSchemas = {
  email,
  username,
  password,
  name,
};
