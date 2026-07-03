import {
  ArrowDown,
  ArrowUp,
  Clock,
  Database,
  Droplets,
  Gauge,
  Thermometer,
  Waves,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Stats } from "@/lib/weather-data"
import { cn } from "@/lib/utils"

type StatCardProps = {
  label: string
  value: string
  unit?: string
  icon: LucideIcon
  accent?: "temp" | "humidity" | "neutral"
}

function StatCard({ label, value, unit, icon: Icon, accent = "neutral" }: StatCardProps) {
  const accentClass =
    accent === "temp"
      ? "text-[var(--chart-1)]"
      : accent === "humidity"
        ? "text-[var(--chart-2)]"
        : "text-muted-foreground"

  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <Icon className={cn("size-4", accentClass)} />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-semibold tracking-tight">{value}</span>
          {unit ? <span className="text-sm text-muted-foreground">{unit}</span> : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function StatCards({ stats }: { stats: Stats | null }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Temperatura atual" value={stats.currentTemp.toFixed(1)} unit="°C" icon={Thermometer} accent="temp" />
      <StatCard label="Umidade atual" value={String(stats.currentHumidity)} unit="%" icon={Droplets} accent="humidity" />
      <StatCard label="Mínima hoje" value={stats.minTemp.toFixed(1)} unit="°C" icon={ArrowDown} accent="temp" />
      <StatCard label="Máxima hoje" value={stats.maxTemp.toFixed(1)} unit="°C" icon={ArrowUp} accent="temp" />
      <StatCard label="Média temp. hoje" value={stats.avgTemp.toFixed(1)} unit="°C" icon={Gauge} accent="temp" />
      <StatCard label="Média umidade hoje" value={String(stats.avgHumidity)} unit="%" icon={Waves} accent="humidity" />
      <StatCard label="Total de medições" value={stats.totalMeasurements.toLocaleString("pt-BR")} icon={Database} />
      <StatCard label="Intervalo de amostragem" value={stats.samplingInterval} icon={Clock} />
    </div>
  )
}
