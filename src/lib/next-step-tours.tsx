import type { Tour } from "nextstepjs";

export const nextStepTours: Tour[] = [
  {
    tour: "firsttour",
    steps: [
      {
        icon: <>👋</>,
        title: "Welcome to SokratesT",
        content: (
          <>
            This is your sidebar. You can reach all important content from here.
          </>
        ),
        selector: "#tour1-step1",
        side: "right",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: <>🎉</>,
        title: "Overview Page",
        content: (
          <>
            Get a quick overview of your past activities and jump back in
            quickly.
          </>
        ),
        selector: "#tour1-step2",
        side: "top",
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
        icon: <>🚀</>,
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
