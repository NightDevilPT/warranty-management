"use client";

import { Button } from "@workspace/ui/components/button";
import { useTheme } from "@workspace/ui/context/theme-context";
import { ThemeToggle } from "@workspace/ui/shared/theme-toggle/theme-toggle";

export default function Page() {
  const { dictionary } = useTheme();
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{dictionary?.welcome}</h1>
        <Button size="sm">Button</Button>
      </div>
      <ThemeToggle />
    </div>
  );
}
