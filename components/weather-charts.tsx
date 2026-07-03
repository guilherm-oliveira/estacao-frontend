"use client"

import { useMemo } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { formatTimestamp, PERIODS, type Measurement, type Period } from "@/lib/weather-data"

const chartConfig = {
  temperature: { label: "Temperatura (°C)", color: "var(--chart-1)" },
  humidity: { label: "Umidade (%)", color: "var(--chart-2)" },
} satisfies ChartConfig

function PeriodSelector({
  period,
  onChange,
}: {
  period: Period
  onChange: (p: Period) => void
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-full border border-border bg-muted/50 p-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium transition-colors",
            period === p.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

export function WeatherCharts({
  period,
  onPeriodChange,
  data: measurements,
}: {
  period: Period
  onPeriodChange: (p: Period) => void
  data: Measurement[]
}) {
  const data = useMemo(
    () =>
      measurements.map((m) => ({
        ...m,
        label: formatTimestamp(m.timestamp, period),
      })),
    [measurements, period],
  )

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Histórico</h2>
        <PeriodSelector period={period} onChange={onPeriodChange} />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">Temperatura e umidade</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[360px] w-full">
            <LineChart data={data} margin={{ left: 4, right: 4, top: 8, bottom: 4 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(ts) => formatTimestamp(ts, period)}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={32}
                className="text-xs"
              />
              <YAxis
                yAxisId="temperature"
                orientation="left"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={40}
                domain={["dataMin - 2", "dataMax + 2"]}
                stroke="var(--color-temperature)"
                className="text-xs"
                unit="°"
              />
              <YAxis
                yAxisId="humidity"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={40}
                domain={[0, 100]}
                stroke="var(--color-humidity)"
                className="text-xs"
                unit="%"
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(_, payload) => {
                      const ts = payload?.[0]?.payload?.timestamp
                      return ts ? formatTimestamp(Number(ts), period) : ""
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                yAxisId="temperature"
                dataKey="temperature"
                type="monotone"
                stroke="var(--color-temperature)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="humidity"
                dataKey="humidity"
                type="monotone"
                stroke="var(--color-humidity)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </section>
  )
}
