export type Period = "24h" | "7d" | "30d" | "3m" | "1y" | "5y"

export type Measurement = {
  timestamp: number
  temperature: number
  humidity: number
}

export type MeasurementDTO = {
  count: number,
  measurements: {
    id: number
    stationIdentifier: string
    temperature: number
    humidity: number
    measuredAt: string
    createdAt: string
  }[]
}

export type Station = {
  id: string
  name: string
  device: string
}

export const STATIONS: Station[] = [
  { id: "casa", name: "Estação Casa", device: "ESP32 + DHT22" },
  { id: "jardim", name: "Estação Jardim", device: "ESP32 + DHT22" },
]

export function getStation(stationId: string): Station {
  return STATIONS.find((s) => s.id === stationId) ?? STATIONS[0]
}

export const PERIODS: { value: Period; label: string }[] = [
  { value: "24h", label: "24 horas" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "3m", label: "3 meses" },
  { value: "1y", label: "1 ano" },
  { value: "5y", label: "5 anos" },
]

export type Stats = {
  currentTemp: number
  currentHumidity: number
  minTemp: number
  maxTemp: number
  avgTemp: number
  avgHumidity: number
  totalMeasurements: number
  samplingInterval: string
}

export function formatTimestamp(timestamp: number, period: Period): string {
  const date = new Date(timestamp)
  if (period === "24h") {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) 
  }
  if (period === "7d" || period === "30d") {
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
  }
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
}
