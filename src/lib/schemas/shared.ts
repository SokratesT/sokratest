import { z } from "zod";

const email = z.string().email({
  message: "Invalid email address.",
});

const username = z.string().min(3, {
  message: "Username must be at least 3 characters.",
});

const password = z.string().min(8, {
  message: "Password must be at least 8 characters.",
});

export const sharedSchemas = {
  email,
  username,
  password,
};
