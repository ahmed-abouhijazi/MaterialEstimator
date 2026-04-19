"use client"

import React, { useCallback, useEffect, useState } from "react"
import type { ProjectType } from "@/lib/calculations"
import type { AIFloorPlanLayout, AIRoom } from "@/app/api/ai-floorplan/route"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, RefreshCw } from "lucide-react"

type Props = {
  projectType?: ProjectType
  length?: number
  width?: number
  height?: number
  numberOfRooms?: number
  numberOfBathrooms?: number
  numberOfFloors?: number
  hasBalcony?: boolean
  layoutIntent?: "open" | "balanced" | "zoned"
  autoGenerate?: boolean
  onDimensionChange: (field: "length" | "width" | "height", value: number) => void
  onStatusChange?: (status: "idle" | "loading" | "success" | "error") => void
}

// SVG canvas size
const VW = 600
const VH = 440
// Margins around the building drawing
const ML = 54  // left margin (for vertical dimension label)
const MT = 44  // top margin (for horizontal dimension label)
const MR = 20  // right margin
const MB = 46  // bottom margin (for entry label)

export function FloorPlan2D({
  projectType = "house",
  length = 10,
  width = 8,
  height = 2.8,
  numberOfRooms = 3,
  numberOfBathrooms = 1,
  numberOfFloors = 1,
  hasBalcony = false,
  layoutIntent = "balanced",
  autoGenerate = false,
  onDimensionChange,
  onStatusChange,
}: Props) {
  const [aiLayout, setAiLayout] = useState<AIFloorPlanLayout | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const generateAIPlan = useCallback(async () => {
    setIsGenerating(true)
    setAiError(null)
    onStatusChange?.("loading")
    try {
      const res = await fetch("/api/ai-floorplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType, length, width, height,
          numberOfRooms, numberOfBathrooms, numberOfFloors,
          hasBalcony, layoutIntent,
        }),
      })
      if (!res.ok) throw new Error("API error")
      const data: AIFloorPlanLayout = await res.json()
      setAiLayout(data)
      onStatusChange?.("success")
    } catch {
      setAiError("Could not generate AI plan. Check your API key.")
      onStatusChange?.("error")
    } finally {
      setIsGenerating(false)
    }
  }, [projectType, length, width, height, numberOfRooms, numberOfBathrooms, numberOfFloors, hasBalcony, layoutIntent, onStatusChange])

  // Auto-generate when parent triggers it (e.g. moving from step 2 to step 3)
  useEffect(() => {
    if (autoGenerate) void generateAIPlan()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate])

  const L = Math.max(length || 10, 3)
  const W = Math.max(width || 8, 3)
  const nRooms = Math.max(numberOfRooms || 1, 1)
  const nFloors = numberOfFloors || 1

  // Reserve space for deck
  const deckPx = (hasBalcony && !aiLayout) ? 68 : 0
  const deckGap = (hasBalcony && !aiLayout) ? 8 : 0

  // Available drawing area
  const availW = VW - ML - MR - deckPx - deckGap
  const availH = VH - MT - MB

  // Scale building to fit, preserving aspect ratio
  const scale = Math.min((availW * 0.92) / L, (availH * 0.92) / W)
  const bW = L * scale  // building width in SVG pixels
  const bH = W * scale  // building depth in SVG pixels

  // Center the building within the available area
  const ox = ML + (availW - bW) / 2
  const oy = MT + (availH - bH) / 2

  // ─── Grid layout fractions ─────────────────────────────────────────────
  const leftFrac = 0.40   // left service column (bath + kitchen + dining)
  const lW = bW * leftFrac
  const rW = bW - lW

  const topFrac  = 0.30   // bathroom / bedroom row
  const midFrac  = 0.40   // kitchen  / living row
  const botFrac  = 1 - topFrac - midFrac  // dining   / bedroom-2 row

  const topH = bH * topFrac
  const midH = bH * midFrac
  const botH = bH * botFrac

  // ─── Room objects ───────────────────────────────────────────────────────
  type Room = { id: string; label: string; sub: string; x: number; y: number; w: number; h: number }
  let rooms: Room[] = []

  const isResidential = ["house", "extension", "renovation"].includes(projectType)

  if (aiLayout) {
    // Convert AI fractional positions to absolute SVG pixels
    rooms = aiLayout.rooms.map((r: AIRoom) => ({
      id: r.id,
      label: r.label,
      sub: r.sub,
      x: ox + r.xFrac * bW,
      y: oy + r.yFrac * bH,
      w: r.wFrac * bW,
      h: r.hFrac * bH,
    }))
  } else if (isResidential) {
    // ── Left column ──
    const bathH  = topH * 0.54
    const closetH = topH - bathH

    rooms.push({ id: "bath",    label: "BATHROOM", sub: "TILE",              x: ox,           y: oy,            w: lW,       h: bathH   })
    rooms.push({ id: "closet",  label: "CLOSET",   sub: "CARPET",            x: ox,           y: oy + bathH,    w: lW * 0.6, h: closetH })
    rooms.push({ id: "counter", label: "COUNTER",  sub: "",                  x: ox + lW * 0.6, y: oy + bathH,  w: lW * 0.4, h: closetH })
    rooms.push({ id: "kitchen", label: "KITCHEN",  sub: "SHEET VINYL FLOOR", x: ox,           y: oy + topH,     w: lW,       h: midH    })
    rooms.push({ id: "dining",  label: "DINING",   sub: "SHEET VINYL FLOOR", x: ox,           y: oy + topH + midH, w: lW,   h: botH    })

    // ── Right column ──
    if (nRooms === 1) {
      rooms.push({ id: "bed1",   label: "BEDROOM",     sub: "CARPET",     x: ox + lW, y: oy,            w: rW, h: topH          })
      rooms.push({ id: "living", label: "LIVING ROOM", sub: "WOOD FLOOR", x: ox + lW, y: oy + topH,     w: rW, h: midH + botH   })
    } else if (nRooms === 2) {
      rooms.push({ id: "bed1",   label: "BEDROOM 1",   sub: "CARPET",     x: ox + lW, y: oy,            w: rW, h: topH })
      rooms.push({ id: "living", label: "LIVING ROOM", sub: "WOOD FLOOR", x: ox + lW, y: oy + topH,     w: rW, h: midH })
      rooms.push({ id: "bed2",   label: "BEDROOM 2",   sub: "CARPET",     x: ox + lW, y: oy + topH + midH,w: rW, h: botH })
    } else {
      const split = rW * 0.48
      rooms.push({ id: "bed1",   label: "BEDROOM 2",   sub: "CARPET",     x: ox + lW,          y: oy,                w: split,      h: topH })
      rooms.push({ id: "bed2",   label: "BEDROOM 3",   sub: "CARPET",     x: ox + lW + split,   y: oy,                w: rW - split, h: topH })
      rooms.push({ id: "living", label: "LIVING ROOM", sub: "WOOD FLOOR", x: ox + lW,           y: oy + topH,         w: rW,         h: midH })
      rooms.push({ id: "bed3",   label: nRooms >= 4 ? "BEDROOM 4" : "BEDROOM 1", sub: "CARPET", x: ox + lW, y: oy + topH + midH, w: rW, h: botH })
    }
  } else if (projectType === "room") {
    rooms.push({ id: "room", label: "ROOM", sub: "FLOOR", x: ox, y: oy, w: bW, h: bH })
  } else if (projectType === "wall") {
    rooms.push({ id: "wall", label: "WALL ELEVATION", sub: `Height: ${(height || 2.8).toFixed(1)} m`, x: ox, y: oy, w: bW, h: bH })
  } else if (projectType === "foundation") {
    rooms.push({ id: "found", label: "FOUNDATION PLAN", sub: "", x: ox, y: oy, w: bW, h: bH })
  } else if (projectType === "roof") {
    rooms.push({ id: "roof", label: "ROOF PLAN", sub: "", x: ox, y: oy, w: bW, h: bH })
  } else {
    rooms.push({ id: "proj", label: projectType.toUpperCase(), sub: "", x: ox, y: oy, w: bW, h: bH })
  }

  // Staircase position
  const stairsX = aiLayout ? ox + aiLayout.stairsXFrac * bW : ox + lW + rW * 0.36
  const stairsY = aiLayout ? oy + aiLayout.stairsYFrac * bH : oy + topH - 20
  const showStairs = aiLayout ? aiLayout.hasStairs : nFloors > 1
  const entryX = aiLayout ? ox + aiLayout.entryXFrac * bW : ox + bW * 0.5

  // ─── Helpers ────────────────────────────────────────────────────────────
  const fmt  = (m: number) => `${m.toFixed(1)} m`
  const dim  = (pw: number, ph: number) => `${(pw / scale).toFixed(1)} × ${(ph / scale).toFixed(1)} m`
  const area = (L * W).toFixed(0)

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
          2D Floor Plan
          {aiLayout?.generatedByAI && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">AI Generated</span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {aiLayout && (
              <Button
                type="button" variant="outline" size="sm"
                onClick={() => setAiLayout(null)}
                className="h-7 gap-1 text-xs"
              >
                <RefreshCw className="h-3 w-3" /> Reset
              </Button>
            )}
            <Button
              type="button" size="sm"
              onClick={() => { void generateAIPlan() }}
              disabled={isGenerating}
              className="h-7 gap-1 text-xs"
            >
              {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {isGenerating ? "Generating…" : aiLayout ? "Regenerate" : "AI Generate"}
            </Button>
          </div>
        </CardTitle>
        {aiError && <p className="text-xs text-destructive">{aiError}</p>}
      </CardHeader>

      <CardContent className="p-3 pt-0">
        {/* ─── SVG Plan ─────────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-lg border border-border bg-white dark:bg-zinc-950">
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            width="100%"
            className="block"
            style={{ maxHeight: 360 }}
          >
            <defs>
              <marker id="fp-arrow" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto">
                <path d="M1,1 L3,5 L5,1" fill="none" stroke="#666" strokeWidth="1" />
              </marker>
              <pattern id="fp-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="4" stroke="#ccc" strokeWidth="1.5" />
              </pattern>
            </defs>

            {/* ── Width dimension (top) ── */}
            <DimLine
              x1={ox} y1={oy - 24}
              x2={ox + bW} y2={oy - 24}
              label={fmt(L)} axis="h"
            />

            {/* ── Depth dimension (left) ── */}
            <DimLine
              x1={ox - 32} y1={oy}
              x2={ox - 32} y2={oy + bH}
              label={fmt(W)} axis="v"
            />

            {/* ── Outer walls (filled white so room labels read cleanly) ── */}
            <rect x={ox} y={oy} width={bW} height={bH} fill="white" />
            <rect
              x={ox} y={oy} width={bW} height={bH}
              fill="none" stroke="#1a1a1a" strokeWidth={4}
            />

            {/* ── Interior partitions ── */}
            {rooms.map(r => (
              <rect
                key={`wall-${r.id}`}
                x={r.x} y={r.y} width={r.w} height={r.h}
                fill="none" stroke="#444" strokeWidth={1.5}
              />
            ))}

            {/* ── Room labels ── */}
            {rooms.map(r => {
              const fs  = Math.min(10, r.w / 7, r.h / 4.5)
              const fss = Math.min(8,  r.w / 9, r.h / 6)
              const cy  = r.y + r.h / 2
              const labelY = r.sub ? cy - 11 : cy - 6
              return (
                <g key={`lbl-${r.id}`}>
                  <text x={r.x + r.w / 2} y={labelY} textAnchor="middle"
                    fontSize={fs} fontWeight="700" fontFamily="ui-monospace,monospace" fill="#111">
                    {r.label}
                  </text>
                  {r.sub && (
                    <text x={r.x + r.w / 2} y={cy + 1} textAnchor="middle"
                      fontSize={fss} fontFamily="ui-monospace,monospace" fill="#888">
                      {r.sub}
                    </text>
                  )}
                  <text x={r.x + r.w / 2} y={r.sub ? cy + 13 : cy + 8} textAnchor="middle"
                    fontSize={fss} fontFamily="ui-monospace,monospace" fill="#666">
                    {dim(r.w, r.h)}
                  </text>
                </g>
              )
            })}

            {/* ── Staircase (multi-floor) ── */}
            {showStairs && (
              <g>
                <rect
                  x={stairsX} y={stairsY}
                  width={bW * 0.12} height={20}
                  fill="#f0f0f0" stroke="#777" strokeWidth={1}
                />
                {[0, 1, 2, 3, 4].map(i => (
                  <line
                    key={i}
                    x1={stairsX} y1={stairsY + 4 + i * 4}
                    x2={stairsX + bW * 0.12} y2={stairsY + 4 + i * 4}
                    stroke="#aaa" strokeWidth={0.9}
                  />
                ))}
                <text
                  x={stairsX + bW * 0.06} y={stairsY - 4}
                  textAnchor="middle" fontSize={7.5} fill="#777"
                  fontFamily="ui-monospace,monospace">UP</text>
              </g>
            )}

            {/* ── Exterior deck ── */}
            {hasBalcony && (
              <>
                <rect
                  x={ox + bW + deckGap} y={oy + topH}
                  width={deckPx} height={midH + botH}
                  fill="#f9f9f9" stroke="#777" strokeWidth={1.5} strokeDasharray="5,3"
                />
                <text
                  x={ox + bW + deckGap + deckPx / 2} y={oy + topH + (midH + botH) / 2 - 9}
                  textAnchor="middle" fontSize={9} fontWeight="700"
                  fontFamily="ui-monospace,monospace" fill="#555">EXTERIOR</text>
                <text
                  x={ox + bW + deckGap + deckPx / 2} y={oy + topH + (midH + botH) / 2 + 4}
                  textAnchor="middle" fontSize={9} fontWeight="700"
                  fontFamily="ui-monospace,monospace" fill="#555">DECK</text>
                <text
                  x={ox + bW + deckGap + deckPx / 2} y={oy + topH + (midH + botH) / 2 + 17}
                  textAnchor="middle" fontSize={7.5}
                  fontFamily="ui-monospace,monospace" fill="#999">
                  {`${(deckPx / scale).toFixed(1)} × ${((midH + botH) / scale).toFixed(1)} m`}
                </text>
              </>
            )}

            {/* ── Main entry arrow ── */}
            <line
              x1={entryX} y1={oy + bH + 2}
              x2={entryX} y2={oy + bH + 12}
              stroke="#555" strokeWidth={1.5}
              markerEnd="url(#fp-arrow)"
            />
            <text
              x={entryX} y={oy + bH + 30}
              textAnchor="middle" fontSize={8.5} fontWeight="700"
              fontFamily="ui-monospace,monospace" fill="#555">MAIN ENTRY</text>

            {/* ── Floor count badge ── */}
            {nFloors > 1 && (
              <text
                x={ox + bW - 6} y={oy + 14}
                textAnchor="end" fontSize={8}
                fontFamily="ui-monospace,monospace" fill="#888">{nFloors} floors</text>
            )}
          </svg>
        </div>

        {/* ─── Dimension inputs ──────────────────────────────────────────── */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <DimInput label="Length (m)" value={length} onChange={v => onDimensionChange("length", v)} min={2} max={80} step={0.1} />
          <DimInput label="Width (m)"  value={width}  onChange={v => onDimensionChange("width", v)}  min={2} max={80} step={0.1} />
          <DimInput label="Height (m)" value={height} onChange={v => onDimensionChange("height", v)} min={2} max={8}  step={0.1} />
        </div>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          {nRooms} room{nRooms !== 1 ? "s" : ""} · {numberOfBathrooms || 1} bathroom{(numberOfBathrooms || 1) !== 1 ? "s" : ""} · {area} m² floor area
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

type DimLineProps = {
  x1: number; y1: number
  x2: number; y2: number
  label: string
  axis: "h" | "v"
}

function DimLine({ x1, y1, x2, y2, label, axis }: DimLineProps) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const tk = 5  // tick half-length

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#aaa" strokeWidth={1} />
      {axis === "h" ? (
        <>
          <line x1={x1} y1={y1 - tk} x2={x1} y2={y1 + tk} stroke="#aaa" strokeWidth={1} />
          <line x1={x2} y1={y2 - tk} x2={x2} y2={y2 + tk} stroke="#aaa" strokeWidth={1} />
          <text x={mx} y={y1 - 8} textAnchor="middle" fontSize={11} fontWeight="700"
            fontFamily="ui-monospace,monospace" fill="#333">{label}</text>
        </>
      ) : (
        <>
          <line x1={x1 - tk} y1={y1} x2={x1 + tk} y2={y1} stroke="#aaa" strokeWidth={1} />
          <line x1={x2 - tk} y1={y2} x2={x2 + tk} y2={y2} stroke="#aaa" strokeWidth={1} />
          <text
            x={mx} y={my}
            textAnchor="middle" fontSize={11} fontWeight="700"
            fontFamily="ui-monospace,monospace" fill="#333"
            transform={`rotate(-90,${mx},${my})`}>{label}</text>
        </>
      )}
    </g>
  )
}

type DimInputProps = {
  label: string; value?: number
  onChange: (v: number) => void
  min: number; max: number; step: number
}

function DimInput({ label, value, onChange, min, max, step }: DimInputProps) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={value ?? ""}
        min={min} max={max} step={step}
        onChange={e => {
          const v = parseFloat(e.target.value)
          if (!isNaN(v) && v >= min) onChange(v)
        }}
        className="h-9 font-mono text-sm"
      />
    </div>
  )
}
