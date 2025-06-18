"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";

export const revalidatePathFromClient = authActionClient
  .metadata({ actionName: "revalidatePathFromClient" })
  .schema(z.object({ path: z.string() }))
  .action(async ({ parsedInput: { path } }) => {
    revalidatePath(path);

    return { error: null };
  });
