"use client";

// 1. React/Next.js dependencies
import * as React from "react";

// 2. Third-party packages
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip } from "recharts";

// 3. Shared Workspace Packages (@workspace/ui)
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

// 4. Portal-specific Modules (@/)
// (none)

// 5. Local Components (./_components)
// (none)

interface StatItem {
  label: string;
  count: number;
}

export function OrgTypeChart({ data }: { data: StatItem[] }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organizations by Type</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          No organization type data to display
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizations by Type</CardTitle>
        <CardDescription>
          Distribution across organization types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="h-[300px] w-full flex items-center justify-center"
        >
          {dimensions ? (
            <BarChart
              width={dimensions.width}
              height={dimensions.height}
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="3 3"
                opacity={0.3}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                content={({ active, payload }) => {
                  const firstPayload = payload?.[0];
                  if (active && payload && payload.length && firstPayload) {
                    return (
                      <div className="rounded-lg border bg-card p-2 shadow-sm text-xs">
                        <p className="font-semibold text-foreground">
                          {firstPayload.payload?.label}
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          Organizations:{" "}
                          <span className="font-medium text-foreground">
                            {firstPayload.value}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="var(--chart-1)" radius={8} />
            </BarChart>
          ) : (
            <div className="w-full h-full" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
