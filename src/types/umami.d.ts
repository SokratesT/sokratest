export {};

declare global {
  interface Window {
    umami: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
      identify: (user: { id: string; email?: string }) => void;
    };
  }

  const umami: typeof window.umami;
}
