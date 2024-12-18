"use server";

import { revalidatePath } from "next/cache";

export const revalidatePathFromClient = async (path: string) => {
  revalidatePath(path);
};
