"use client";

import { CompassIcon } from "lucide-react";
import { useNextStep } from "nextstepjs";
import { Button } from "../ui/button";

const AppTourButton = () => {
  const { startNextStep, closeNextStep } = useNextStep();

  const onClickHandler = (tourName: string) => {
    startNextStep(tourName);
  };

  // TODO: Expose props for customizing the button
  return (
    <Button
      variant="secondary"
      onClick={() => onClickHandler("firsttour")}
      className="w-full justify-start"
    >
      <CompassIcon className="mr-2 h-4 w-4" /> Start Tour
    </Button>
  );
};

export { AppTourButton };
