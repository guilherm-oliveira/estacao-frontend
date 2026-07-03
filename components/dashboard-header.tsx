"use client"

import { MapPin, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getStation, STATIONS } from "@/lib/weather-data"

export function DashboardHeader({
  stationId,
  onStationChange,
  lastRead
}: {
  stationId: string
  lastRead: string
  onStationChange: (id: string) => void
}) {
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const station = getStation(stationId)

  useEffect(() => {
    const update = () =>
      setLastUpdate(
        new Date().toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      )
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Estação Meteorológica</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {station.device}
          </span>
          <span className="flex items-center gap-1.5">
            <RefreshCw className="size-3.5" />
            Ultima leitura {lastRead}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select value={stationId} onValueChange={onStationChange}>
          <SelectTrigger className="w-[180px] rounded-full" aria-label="Selecionar estação">
            <SelectValue>{(value: string) => getStation(value).name}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATIONS.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--success)] opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-[var(--success)]" />
          </span>
          Online
        </span>
        <ThemeToggle />
      </div>
    </header>
  )
}
