"use server";

import { authActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const revalidatePathFromClient = authActionClient
  .metadata({ actionName: "revalidatePathFromClient" })
  .schema(z.object({ path: z.string() }))
  .action(async ({ parsedInput: { path } }) => {
    revalidatePath(path);

    return { error: null };
  });
