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
            Great to have you here! Let&apos;s take a quick tour through the
            app. Click &quot;Next&quot; to proceed.
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
            Your previous chats will appear here. To keep the list organised,
            you can delete or rename chats.
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
        title: "You are all set!",
        content: (
          <>
            Enjoy the AI Tutoring System as your companion on your learning
            journey — available 24/7. The project team is also looking forward
            to potential feedback of yours about your experiences in using the
            system.
            <br />
            <Link
              className="text-muted-foreground text-sm"
              href="mailto:sokratest@hochschule-rhein-waal.de"
            >
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
  // TODO: Target relevant elements in the chat interface
  {
    tour: "chatTour",
    steps: [
      {
        icon: null,
        title: "Chat",
        content: (
          <>
            You got your first response! Let&apos;s take a quick tour through
            the chat interface. Click &quot;Next&quot; to proceed.
          </>
        ),
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: null,
        title: "References",
        content: (
          <>
            The response includes references to course material the AI deemed
            relevant. Note that not all material indicated here may be directly
            cited by the AI, but all of it is used to guide the response.
          </>
        ),
        // selector: "#ai-annotations",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
        viewportID: "chat-viewport",
      },
      {
        icon: null,
        title: "Rate responses",
        content: (
          <>
            Please rate the responses you received by using the buttons below.
            This will help us improve the AI Tutor in the future. Note that
            rating does not have a direct impact on the current chat.
          </>
        ),
        // selector: "#ai-message-rate",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
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
      }
    },
    onComplete: async (tourName: string | null) => {
      if (tourName === "initialTour" || tourName === "chatTour") {
        await completeTour({ tour: tourName, action: "completed" });
      }
    },
    onSkip: async (step: number, tourName: string | null) => {
      if (tourName === "initialTour" || tourName === "chatTour") {
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
