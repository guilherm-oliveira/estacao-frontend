"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Measurement } from "@/lib/weather-data"

const PAGE_SIZE = 8

export function MeasurementsTable({ data }: { data: Measurement[] }) {
  const [page, setPage] = useState(0)

  const rows = useMemo(() => data.slice().reverse(), [data])
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pageRows = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-medium">Medições recentes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data e hora</TableHead>
                <TableHead className="text-right">Temperatura</TableHead>
                <TableHead className="text-right">Umidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((m) => (
                <TableRow key={m.timestamp}>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {new Date(m.timestamp).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {m.temperature.toFixed(1)} °C
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{m.humidity} %</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Página anterior"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Próxima página"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
