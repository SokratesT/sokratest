"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { AlertCircleIcon } from "lucide-react";
import { posthog } from "posthog-js";
import { useEffect } from "react";

const DefaultErrorPage = ({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) => {
  useEffect(() => {
    posthog.captureException(error);
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="h-5 w-5 text-destructive" />
            <h2 className="font-semibold text-lg">Something went wrong</h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{error.message}</p>
          {error.digest && (
            <p className="mt-2 text-muted-foreground text-xs">
              Error ID: {error.digest}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export { DefaultErrorPage };
