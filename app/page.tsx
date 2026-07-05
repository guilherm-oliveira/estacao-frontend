"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { MeasurementsTable } from "@/components/measurements-table"
import { StatCards } from "@/components/stat-cards"
import { WeatherCharts } from "@/components/weather-charts"
import {
  MeasurementDTO,
  type Measurement,
  type Period,
  type Stats,
} from "@/lib/weather-data"



export default function Page() {
  const [period, setPeriod] = useState<Period>("24h")
  const [stationId, setStationId] = useState("casa")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawData, setRawData] = useState<Measurement[]>([])
  const [countMeasurements, setCountMeasurements] = useState<number>(0)
  
  const lastRead = useMemo(() => {
    const lastTimestamp = rawData.at(-1)?.timestamp;
    
    if (!lastTimestamp) return '--:--:--';

    return new Date(lastTimestamp).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }, [rawData]);

  const last24h = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    return rawData.filter((m) => m.timestamp >= cutoff)
  }, [rawData]);

  const stats = useMemo<Stats | null>(() => {
    const cutoff = new Date()
    cutoff.setHours(0, 0, 0, 0)
    const todayData = last24h.filter((m) => m.timestamp >= cutoff.getTime())

    if (todayData.length === 0) return null
    const temps = todayData.map((m) => m.temperature)
    const hums = todayData.map((m) => m.humidity)
    const lastMeasurement = todayData[todayData.length - 1]

    return {
      currentTemp: lastMeasurement.temperature,
      currentHumidity: lastMeasurement.humidity,
      minTemp: Math.min(...temps),
      maxTemp: Math.max(...temps),
      avgTemp: temps.reduce((a, b) => a + b, 0) / temps.length,
      avgHumidity: +(hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1),
      totalMeasurements: countMeasurements,
      samplingInterval: "2 minutos",
    }
  }, [last24h, countMeasurements]);

  const PERIOD_MS: Record<Period, number> = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "3m": 90 * 24 * 60 * 60 * 1000,
    "1y": 365 * 24 * 60 * 60 * 1000,
    "5y": 5 * 365 * 24 * 60 * 60 * 1000,
  }

  const api = 'https://estacao-meteorologica-production-dbd2.up.railway.app';

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const initialDate = new Date(Date.now() - PERIOD_MS[period]).toISOString();
        const res = await fetch(`${api}/measurements?estacao=casa&initialDate=${initialDate}`);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: MeasurementDTO = await res.json();
        const dataMapped: Measurement[] = data.measurements.map((value) => ({
          humidity: value.humidity,
          timestamp: new Date(value.measuredAt).getTime(),
          temperature: value.temperature
        })).sort((a,b) => a.timestamp - b.timestamp);

        if (!cancelled) {
          setRawData(dataMapped)
          setCountMeasurements(data.count);
        };

      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()

    return () => { cancelled = true } // cleanup
  }, [period, stationId])

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader lastRead={lastRead} stationId={stationId} onStationChange={setStationId} />
      <StatCards stats={stats} />
      <WeatherCharts period={period} onPeriodChange={setPeriod} data={rawData} />
      <MeasurementsTable data={last24h} />
    </main>
  )
}
