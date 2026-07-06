"use client"

import { useMemo } from "react"
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
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

function findNearestTimestamp(sortedTimestamps: number[], target: number) {
  let low = 0
  let high = sortedTimestamps.length - 1

  while (low < high) {
    const middle = Math.floor((low + high) / 2)

    if (sortedTimestamps[middle] < target) {
      low = middle + 1
    } else {
      high = middle
    }
  }

  const next = sortedTimestamps[low]
  const previous = sortedTimestamps[low - 1]

  if (previous !== undefined && Math.abs(previous - target) <= Math.abs(next - target)) {
    return previous
  }

  return next
}

function getMidnightDividerTimestamps(measurements: Measurement[]) {
  const sortedTimestamps = measurements
    .map(({ timestamp }) => timestamp)
    .sort((a, b) => a - b)

  if (sortedTimestamps.length === 0) {
    return []
  }

  const firstTimestamp = sortedTimestamps[0]
  const lastTimestamp = sortedTimestamps.at(-1) ?? firstTimestamp
  const firstDate = new Date(firstTimestamp)
  const dayInMilliseconds = 24 * 60 * 60 * 1000
  let midnight = new Date(
    firstDate.getFullYear(),
    firstDate.getMonth(),
    firstDate.getDate(),
  ).getTime()
  const dividerTimestamps: number[] = []

  if (midnight < firstTimestamp) {
    midnight += dayInMilliseconds
  }

  for (; midnight <= lastTimestamp; midnight += dayInMilliseconds) {
    dividerTimestamps.push(findNearestTimestamp(sortedTimestamps, midnight))
  }

  return [...new Set(dividerTimestamps)]
}

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
  const midnightDividerTimestamps = useMemo(
    () => getMidnightDividerTimestamps(measurements),
    [measurements],
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
                type="number"
                domain={["dataMin", "dataMax"]}
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
              {midnightDividerTimestamps.map((timestamp) => (
                <ReferenceLine
                  key={timestamp}
                  x={timestamp}
                  yAxisId="temperature"
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                  strokeOpacity={0.85}
                />
              ))}
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
