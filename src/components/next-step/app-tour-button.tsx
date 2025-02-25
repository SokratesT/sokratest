"use client";

import { useNextStep } from "nextstepjs";
import { Button } from "../ui/button";

const AppTourButton = () => {
  const { startNextStep, closeNextStep } = useNextStep();

  const onClickHandler = (tourName: string) => {
    startNextStep(tourName);
  };

  return (
    <Button onClick={() => onClickHandler("firsttour")}>Start Tour</Button>
  );
};

export { AppTourButton };
