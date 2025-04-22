"use client";

import { NextStepCard } from "@/components/next-step/next-step-card";
import { useSidebar } from "@/components/ui/sidebar";
import { completeTour } from "@/db/actions/user";
import Link from "next/link";
import { NextStep, type Tour } from "nextstepjs";
import type { ReactNode } from "react";

const nextStepTours: Tour[] = [
  {
    tour: "initialTour",
    steps: [
      {
        icon: null,
        title: "Welcome to Sokratesᵗ",
        content: (
          <>
            Great to have you here! Let's take a quick tour through the app.
            Click "Next" to proceed.
          </>
        ),
        side: "right",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: null,
        title: "Sidebar",
        content: (
          <>
            This is your sidebar. You can reach all important content from here.
          </>
        ),
        side: "right",
        selector: "#tour-sidebar",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: null,
        title: "New Chat",
        content: <>Start a new chat with your AI Tutor at any time.</>,
        side: "top-right",
        selector: "#tour-newChat",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: null,
        title: "Chat history",
        content: (
          <>
            Your past chats will appear here. To keep things organised, you can
            delete and rename chats.
          </>
        ),
        side: "top",
        selector: "#tour-history",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: null,
        title: "Account",
        content: (
          <>
            You can manage your account settings, course invitations and more
            here.
          </>
        ),
        side: "top",
        selector: "#tour-account",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: null,
        title: "Switch courses",
        content: (
          <>
            If you have access to multiple courses, you can switch between them
            in the sidebar.
          </>
        ),
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: null,
        title: "Thats it!",
        content: (
          <>
            Now go and have fun on your learning journey! If you have any
            feedback for us, we would love to hear it during the next course
            session, or simply send an email to{" "}
            <Link href="mailto:sokratest@hochschule-rhein-waal.de">
              sokratest@hochschule-rhein-waal.de
            </Link>
          </>
        ),
        side: "right",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
    ],
  },
  {
    tour: "secondtour",
    steps: [
      {
        icon: null,
        title: "Second tour, Step 1",
        content: <>Second tour, first step!</>,
        selector: "#nextstep-step1",
        side: "top",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
        nextRoute: "/foo",
        prevRoute: "/bar",
      },
    ],
  },
];

export const NextStepTours = ({ children }: { children: ReactNode }) => {
  const { setOpenMobile } = useSidebar();

  const nextStepCallbacks = {
    onStepChange: (step: number, tourName: string | null) => {
      if (step === 1 && tourName === "initialTour") {
        setOpenMobile(true);
        console.log("You are on step 1 of the first tour!");
      }
    },
    onComplete: async (tourName: string | null) => {
      if (tourName === "initialTour") {
        await completeTour({ tour: tourName, action: "completed" });
      }
    },
    onSkip: async (step: number, tourName: string | null) => {
      if (tourName === "initialTour") {
        await completeTour({ tour: tourName, action: "skipped" });
      }
    },
  };

  return (
    <NextStep
      steps={nextStepTours}
      cardComponent={NextStepCard}
      {...nextStepCallbacks}
    >
      {children}
    </NextStep>
  );
};
