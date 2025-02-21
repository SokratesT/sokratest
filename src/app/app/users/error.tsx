"use client";

import { DefaultErrorPage } from "@/components/errors/default-error-page";

export default function UsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <DefaultErrorPage error={error} reset={reset} />;
}
