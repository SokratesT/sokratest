"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CardComponentProps } from "nextstepjs";

const NextStepCard = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}: CardComponentProps) => {
  return (
    <Card className="w-xs">
      <CardHeader>
        <CardTitle>
          {step.icon} {step.title}
        </CardTitle>
        <CardDescription>
          {currentStep + 1} of {totalSteps}
        </CardDescription>
      </CardHeader>

      <CardContent>{step.content}</CardContent>
      <CardFooter className="flex justify-end gap-2">
        {currentStep !== 0 && <Button onClick={prevStep}>Previous</Button>}
        {currentStep + 1 < totalSteps && (
          <>
            <Button onClick={nextStep}>Next</Button>
            {step.showSkip && (
              <Button variant="outline" onClick={skipTour}>
                Skip
              </Button>
            )}
          </>
        )}
        {currentStep + 1 === totalSteps && (
          <Button onClick={skipTour}>Finish</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export { NextStepCard };
