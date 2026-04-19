"use client"

import React, { useEffect, useMemo, useState } from "react"
import type { EstimationMode, ProjectType } from "@/lib/calculations"
import type { AILayoutSuggestion } from "@/lib/ai-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Canvas } from "@react-three/fiber"
import { ContactShadows, OrbitControls, RoundedBox, useProgress } from "@react-three/drei"
import { Sparkles } from "lucide-react"
import {
  KenneyBathroomSet,
  KenneyBedroomSet,
  KenneyDiningSet,
  KenneyKitchen,
  KenneyKitchenIsland,
  KenneyLivingSet,
  KenneyPatioSet,
} from "@/components/estimator/kenney-furniture"

type PlannerProps = {
  projectType?: ProjectType
  estimationMode?: EstimationMode
  length?: number
  width?: number
  height?: number
  wallType?: "concrete_blocks" | "bricks" | "wood_frame" | "stone"
  roofType?: "flat" | "pitched" | "mansard"
  hasPlumbing?: boolean
  hasElectricity?: boolean
  numberOfRooms?: number
  numberOfBathrooms?: number
  numberOfFloors?: number
  layoutIntent?: "open" | "balanced" | "zoned"
  styleMood?: "modern" | "warm" | "scandi" | "industrial"
  furnitureDensity?: "minimal" | "balanced" | "cozy"
  lightingMood?: "bright" | "neutral" | "cozy"
  hasBalcony?: boolean
  pro3dMode?: boolean
  showFurniture?: boolean
}

type Segment = {
  position: [number, number, number]
  size: [number, number, number]
  color?: string
}

type Zone = {
  x: number
  z: number
  width: number
  depth: number
}

type PlanLayout = {
  outerWalls: Segment[]
  interiorWalls: Segment[]
  windows: Segment[]
  patio: Zone
  kitchen: Zone
  dining: Zone
  living: Zone
  bedrooms: Zone[]
  baths: Zone[]
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const toSafeDimension = (value: number | undefined, fallback: number, min = 6, max = 24) => {
  if (!value || Number.isNaN(value)) return fallback
  return clamp(value, min, max)
}

const wallPalette: Record<string, string> = {
  concrete_blocks: "#f0eee8",
  bricks: "#f3efe6",
  wood_frame: "#efe7da",
  stone: "#f1f1ed",
}

const getZoneRotation = (zone: Zone) => (zone.width > zone.depth ? Math.PI / 2 : 0)
const getZoneScale = (zone: Zone, base = 2.8) => clamp(Math.min(zone.width, zone.depth) / base, 0.75, 1.2)

function buildPlanLayout(params: {
  safeLength: number
  safeWidth: number
  wallHeight: number
  wallThickness: number
  wallColor: string
  aiLayout: AILayoutSuggestion | null
  openness: number
  layoutIntent: "open" | "balanced" | "zoned"
  hasBalcony: boolean
}): PlanLayout {
  const { safeLength, safeWidth, wallHeight, wallThickness, wallColor, aiLayout, openness, layoutIntent, hasBalcony } = params
  const outerHalfX = safeLength / 2
  const outerHalfZ = safeWidth / 2
  const rightWingWidth = clamp(safeLength * 0.27 * (aiLayout?.zoneWeights.bedroom || 1), 3.1, 4.6)
  const leftSuiteWidth = clamp(safeLength * 0.28, 3.2, 4.5)
  const topBandDepth = clamp(safeWidth * 0.28 * (aiLayout?.zoneWeights.kitchen || 1), 2.7, 4.0)
  const bathZoneDepth = clamp(safeWidth * 0.22, 2.1, 2.8)
  const bottomSuiteDepth = clamp(safeWidth * 0.28, 2.8, 3.5)

  const outerWalls: Segment[] = [
    { position: [0, wallHeight / 2, -outerHalfZ + wallThickness / 2], size: [safeLength, wallHeight, wallThickness], color: wallColor },
    { position: [0, wallHeight / 2, outerHalfZ - wallThickness / 2], size: [safeLength, wallHeight, wallThickness], color: wallColor },
    { position: [-outerHalfX + wallThickness / 2, wallHeight / 2, 0], size: [wallThickness, wallHeight, safeWidth], color: wallColor },
    { position: [outerHalfX - wallThickness / 2, wallHeight / 2, 0], size: [wallThickness, wallHeight, safeWidth], color: wallColor },
  ]

  const interiorWalls: Segment[] = [
    { position: [outerHalfX - rightWingWidth, wallHeight / 2, 0.6], size: [wallThickness, wallHeight, safeWidth - 1.4], color: wallColor },
    { position: [-outerHalfX + leftSuiteWidth, wallHeight / 2, outerHalfZ - bottomSuiteDepth], size: [wallThickness, wallHeight, bottomSuiteDepth + 0.2], color: wallColor },
    { position: [0.2, wallHeight / 2, -outerHalfZ + topBandDepth], size: [safeLength - rightWingWidth - 2.1, wallHeight, wallThickness], color: wallColor },
    { position: [outerHalfX - rightWingWidth / 2, wallHeight / 2, -outerHalfZ + topBandDepth + bathZoneDepth], size: [rightWingWidth, wallHeight, wallThickness], color: wallColor },
    { position: [outerHalfX - rightWingWidth / 2, wallHeight / 2, 0.95], size: [rightWingWidth, wallHeight, wallThickness], color: wallColor },
    { position: [-outerHalfX + leftSuiteWidth / 2 + 0.35, wallHeight / 2, 0.65], size: [leftSuiteWidth - 0.8, wallHeight, wallThickness], color: wallColor },
  ]

  if (openness > 0.62 || aiLayout?.features.openLiving || layoutIntent === "open") {
    interiorWalls.splice(2, 1)
  }

  const windows: Segment[] = [
    { position: [-outerHalfX + 1.15, 1.15, -outerHalfZ + wallThickness + 0.02], size: [1.4, 1.4, 0.05] },
    { position: [outerHalfX - 1.35, 1.15, outerHalfZ - wallThickness - 0.02], size: [1.7, 1.4, 0.05] },
    { position: [outerHalfX - wallThickness - 0.02, 1.15, -outerHalfZ + 1.6], size: [0.05, 1.5, 1.6] },
    { position: [-outerHalfX + wallThickness + 0.02, 1.15, outerHalfZ - 1.55], size: [0.05, 1.5, 1.4] },
  ]

  const patioDepth = clamp(safeWidth * (aiLayout?.features.patio && hasBalcony ? 0.22 : 0.16), 1.8, 2.7)
  const patio: Zone = { x: 0.2, z: outerHalfZ + patioDepth / 2 - 0.15, width: clamp(safeLength * 0.28, 2.6, 3.5), depth: patioDepth }

  const kitchen: Zone = {
    x: -0.15,
    z: -outerHalfZ + topBandDepth / 2 + 0.2,
    width: clamp(safeLength * 0.36 * (aiLayout?.zoneWeights.kitchen || 1), 4.3, 6.8),
    depth: topBandDepth - 0.45,
  }
  const dining: Zone = { x: -outerHalfX + leftSuiteWidth * 0.55, z: -outerHalfZ + topBandDepth * 0.58, width: leftSuiteWidth - 0.75, depth: topBandDepth - 0.7 }
  const living: Zone = {
    x: 0.05,
    z: 0.55,
    width: clamp(safeLength * 0.35 * (aiLayout?.zoneWeights.living || 1), 4.2, 7.1),
    depth: clamp(safeWidth * 0.32 * (aiLayout?.zoneWeights.living || 1), 3.2, 4.9),
  }
  const rightTopBedroom: Zone = { x: outerHalfX - rightWingWidth / 2, z: -outerHalfZ + topBandDepth + 1.1, width: rightWingWidth - 0.55, depth: clamp(safeWidth * 0.24, 2.3, 3.1) }
  const rightBottomBedroom: Zone = { x: outerHalfX - rightWingWidth / 2, z: outerHalfZ - bottomSuiteDepth / 2 - 0.15, width: rightWingWidth - 0.55, depth: bottomSuiteDepth - 0.55 }
  const leftBottomBedroom: Zone = { x: -outerHalfX + leftSuiteWidth / 2, z: outerHalfZ - bottomSuiteDepth / 2 - 0.15, width: leftSuiteWidth - 0.55, depth: bottomSuiteDepth - 0.55 }
  const rightBath: Zone = { x: outerHalfX - rightWingWidth / 2 - 0.1, z: -0.05, width: rightWingWidth - 0.85, depth: bathZoneDepth }
  const leftBath: Zone = { x: -outerHalfX + 0.82, z: 0.85, width: clamp(leftSuiteWidth * 0.52, 1.5, 2.1), depth: clamp(bathZoneDepth * 0.94, 1.7, 2.3) }

  return {
    outerWalls,
    interiorWalls,
    windows,
    patio,
    kitchen,
    dining,
    living,
    bedrooms: [rightTopBedroom, rightBottomBedroom, leftBottomBedroom],
    baths: [rightBath, leftBath],
  }
}

function Wall({ position, size, color }: Segment) {
  return (
    <RoundedBox args={size} radius={0.025} smoothness={3} position={position} castShadow receiveShadow>
      <meshStandardMaterial color={color || "#f2efe8"} roughness={0.92} />
    </RoundedBox>
  )
}

function FloorPanel({ width, depth, color, position = [0, 0, 0], roughness = 0.84 }: { width: number; depth: number; color: string; position?: [number, number, number]; roughness?: number }) {
  return (
    <RoundedBox args={[width, 0.08, depth]} radius={0.03} smoothness={4} position={position} receiveShadow>
      <meshStandardMaterial color={color} roughness={roughness} metalness={0.08} />
    </RoundedBox>
  )
}

function GlassPanel({ position, size }: Segment) {
  return (
    <RoundedBox args={size} radius={0.01} smoothness={2} position={position} castShadow receiveShadow>
      <meshPhysicalMaterial color="#d7eef7" transmission={0.55} roughness={0.08} transparent opacity={0.5} />
    </RoundedBox>
  )
}

function Frame({ position, size, color = "#874e35" }: Segment) {
  return (
    <RoundedBox args={size} radius={0.01} smoothness={2} position={position} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.7} />
    </RoundedBox>
  )
}

function Rug({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  return (
    <RoundedBox args={size} radius={0.05} smoothness={4} position={position} receiveShadow>
      <meshStandardMaterial color={color} roughness={0.95} />
    </RoundedBox>
  )
}

function Sofa({ position, rotation = 0, baseColor = "#70757d", cushionColor = "#8d949d" }: { position: [number, number, number]; rotation?: number; baseColor?: string; cushionColor?: string }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[2.1, 0.44, 0.88]} radius={0.08} smoothness={4} position={[0, 0.32, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={baseColor} roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[2.05, 0.12, 0.74]} radius={0.06} smoothness={4} position={[0, 0.55, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={cushionColor} roughness={0.92} />
      </RoundedBox>
      <RoundedBox args={[2.05, 0.72, 0.14]} radius={0.05} smoothness={4} position={[0, 0.66, -0.37]} castShadow receiveShadow>
        <meshStandardMaterial color={baseColor} roughness={0.92} />
      </RoundedBox>
      <RoundedBox args={[0.14, 0.62, 0.82]} radius={0.05} smoothness={4} position={[-0.97, 0.6, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={baseColor} roughness={0.92} />
      </RoundedBox>
      <RoundedBox args={[0.14, 0.62, 0.82]} radius={0.05} smoothness={4} position={[0.97, 0.6, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={baseColor} roughness={0.92} />
      </RoundedBox>
    </group>
  )
}

function CoffeeTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[1.18, 0.08, 0.68]} radius={0.05} smoothness={4} position={[0, 0.32, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#d8dedf" roughness={0.18} metalness={0.08} />
      </RoundedBox>
      {[-0.45, 0.45].map((x) =>
        [-0.22, 0.22].map((z) => (
          <RoundedBox key={`${x}-${z}`} args={[0.05, 0.3, 0.05]} radius={0.02} smoothness={2} position={[x, 0.16, z]} castShadow receiveShadow>
            <meshStandardMaterial color="#53565b" roughness={0.62} />
          </RoundedBox>
        )),
      )}
    </group>
  )
}

function TVConsole({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[1.8, 0.44, 0.36]} radius={0.04} smoothness={3} position={[0, 0.22, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#6a5546" roughness={0.48} />
      </RoundedBox>
      <RoundedBox args={[1.6, 0.04, 0.32]} radius={0.03} smoothness={3} position={[0, 0.44, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f5f2ec" roughness={0.2} />
      </RoundedBox>
    </group>
  )
}

function SideTable({ position, diameter = 0.4 }: { position: [number, number, number]; diameter?: number }) {
  return (
    <group position={position}>
      <RoundedBox args={[diameter, 0.05, diameter]} radius={0.02} smoothness={2} position={[0, 0.28, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#d8cfc2" roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[0.08, 0.26, 0.08]} radius={0.02} smoothness={2} position={[0, 0.13, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#7a6758" roughness={0.5} />
      </RoundedBox>
    </group>
  )
}

function DiningSet({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[1.65, 0.1, 0.92]} radius={0.04} smoothness={3} position={[0, 0.42, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#825335" roughness={0.62} />
      </RoundedBox>
      {[-0.68, 0.68].map((x) =>
        [-0.33, 0.33].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <RoundedBox args={[0.34, 0.07, 0.34]} radius={0.04} smoothness={3} position={[0, 0.45, 0]} castShadow receiveShadow>
              <meshStandardMaterial color="#70472d" roughness={0.7} />
            </RoundedBox>
            <RoundedBox args={[0.3, 0.42, 0.04]} radius={0.02} smoothness={2} position={[0, 0.65, -0.12]} castShadow receiveShadow>
              <meshStandardMaterial color="#6f4a31" roughness={0.72} />
            </RoundedBox>
          </group>
        )),
      )}
    </group>
  )
}

function KitchenSuite({ position, width, advanced, island }: { position: [number, number, number]; width: number; advanced: boolean; island: boolean }) {
  const cabinetWidth = clamp(width - 0.7, 1.8, 4.4)
  return (
    <group position={position}>
      <RoundedBox args={[cabinetWidth, 0.92, 0.66]} radius={0.04} smoothness={3} position={[0, 0.46, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#563a2d" roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[cabinetWidth, 0.06, 0.68]} radius={0.02} smoothness={2} position={[0, 0.93, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#e6e0d4" roughness={0.26} />
      </RoundedBox>
      <RoundedBox args={[0.58, 1.55, 0.64]} radius={0.03} smoothness={2} position={[cabinetWidth / 2 - 0.32, 0.78, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#64676d" metalness={0.3} roughness={0.35} />
      </RoundedBox>
      <RoundedBox args={[1.95, 0.92, 0.68]} radius={0.06} smoothness={4} position={[0.38, 0.46, 1.05]} castShadow receiveShadow>
        <meshStandardMaterial color="#efe9db" roughness={0.34} />
      </RoundedBox>
      <RoundedBox args={[1.95, 0.06, 0.7]} radius={0.03} smoothness={2} position={[0.38, 0.93, 1.05]} castShadow receiveShadow>
        <meshStandardMaterial color="#f9f8f5" roughness={0.18} />
      </RoundedBox>
      {[-0.22, 0.22, 0.66].map((x) => (
        <group key={x} position={[x, 0, 1.5]}>
          <RoundedBox args={[0.07, 0.66, 0.07]} radius={0.02} smoothness={2} position={[0, 0.33, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#5d5c61" roughness={0.5} />
          </RoundedBox>
          <RoundedBox args={[0.38, 0.06, 0.38]} radius={0.03} smoothness={2} position={[0, 0.72, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#9c9ea4" roughness={0.72} />
          </RoundedBox>
        </group>
      ))}
      {advanced && (
        <RoundedBox args={[0.54, 0.08, 0.36]} radius={0.04} smoothness={2} position={[-0.8, 0.97, 1.02]} castShadow receiveShadow>
          <meshStandardMaterial color="#3c3d41" metalness={0.45} roughness={0.28} />
        </RoundedBox>
      )}
      {island && (
        <group position={[0.6, 0, 1.85]}>
          <RoundedBox args={[1.8, 0.32, 0.76]} radius={0.06} smoothness={3} position={[0, 0.36, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#efe9df" roughness={0.22} />
          </RoundedBox>
          <RoundedBox args={[1.78, 0.08, 0.74]} radius={0.05} smoothness={3} position={[0, 0.6, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#f7f4ec" roughness={0.18} />
          </RoundedBox>
          {[-0.6, 0, 0.6].map((x) => (
            <group key={x} position={[x, 0, -0.38]}>
              <RoundedBox args={[0.34, 0.04, 0.34]} radius={0.03} smoothness={2} position={[0, 0.7, 0]} castShadow receiveShadow>
                <meshStandardMaterial color="#c8c0b4" roughness={0.35} />
              </RoundedBox>
              <RoundedBox args={[0.08, 0.68, 0.08]} radius={0.02} smoothness={2} position={[0, 0.34, 0]} castShadow receiveShadow>
                <meshStandardMaterial color="#615045" roughness={0.5} />
              </RoundedBox>
            </group>
          ))}
        </group>
      )}
    </group>
  )
}

function Bed({ position, rotation = 0, king = false }: { position: [number, number, number]; rotation?: number; king?: boolean }) {
  const width = king ? 1.65 : 1.38
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[width, 0.22, 2.02]} radius={0.06} smoothness={4} position={[0, 0.22, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#d6c5aa" roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[width - 0.08, 0.18, 1.82]} radius={0.06} smoothness={4} position={[0, 0.42, 0.02]} castShadow receiveShadow>
        <meshStandardMaterial color="#efe2d0" roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[width, 0.84, 0.12]} radius={0.04} smoothness={3} position={[0, 0.62, -0.97]} castShadow receiveShadow>
        <meshStandardMaterial color="#8d5d42" roughness={0.72} />
      </RoundedBox>
      <RoundedBox args={[0.42, 0.12, 0.28]} radius={0.04} smoothness={2} position={[-0.32, 0.58, -0.42]} castShadow receiveShadow>
        <meshStandardMaterial color="#f3eee8" roughness={0.92} />
      </RoundedBox>
      <RoundedBox args={[0.42, 0.12, 0.28]} radius={0.04} smoothness={2} position={[0.32, 0.58, -0.42]} castShadow receiveShadow>
        <meshStandardMaterial color="#f3eee8" roughness={0.92} />
      </RoundedBox>
    </group>
  )
}

function Wardrobe({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <RoundedBox args={[1.12, 1.9, 0.52]} radius={0.04} smoothness={3} position={position} rotation={[0, rotation, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#5e4638" roughness={0.62} />
    </RoundedBox>
  )
}

function BathroomSet({ position, compact = false }: { position: [number, number, number]; compact?: boolean }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.72, 0.86, 0.46]} radius={0.03} smoothness={2} position={[-0.3, 0.43, -0.25]} castShadow receiveShadow>
        <meshStandardMaterial color="#54413a" roughness={0.72} />
      </RoundedBox>
      <RoundedBox args={[0.74, 0.05, 0.48]} radius={0.02} smoothness={2} position={[-0.3, 0.88, -0.25]} castShadow receiveShadow>
        <meshStandardMaterial color="#e9e8e5" roughness={0.28} />
      </RoundedBox>
      <RoundedBox args={[0.4, 0.44, 0.58]} radius={0.06} smoothness={4} position={[0.46, 0.22, -0.15]} castShadow receiveShadow>
        <meshStandardMaterial color="#f6f6f2" roughness={0.46} />
      </RoundedBox>
      <RoundedBox args={[0.72, 0.08, compact ? 0.82 : 1.08]} radius={0.03} smoothness={3} position={[-0.05, 0.05, 0.56]} receiveShadow>
        <meshStandardMaterial color="#e7ecef" roughness={0.25} />
      </RoundedBox>
      <GlassPanel position={[0.24, 0.7, 0.96]} size={[0.05, 1.2, compact ? 0.82 : 1.08]} />
    </group>
  )
}

function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <RoundedBox args={[0.34, 0.24, 0.34]} radius={0.03} smoothness={2} position={[0, 0.12, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#bbb8b1" roughness={0.76} />
      </RoundedBox>
      <mesh position={[0, 0.58, 0]} castShadow>
        <coneGeometry args={[0.34, 0.9, 8]} />
        <meshStandardMaterial color="#759465" roughness={0.88} />
      </mesh>
    </group>
  )
}

function StairBlock({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {Array.from({ length: 5 }).map((_, index) => (
        <RoundedBox
          key={index}
          args={[0.72, 0.12, 0.28]}
          radius={0.02}
          smoothness={2}
          position={[0, 0.06 + index * 0.12, index * 0.18]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#d7d8dc" roughness={0.7} />
        </RoundedBox>
      ))}
    </group>
  )
}

function PlanScene({
  projectType,
  estimationMode,
  length,
  width,
  height,
  wallType,
  roofType,
  hasPlumbing,
  hasElectricity,
  numberOfRooms,
  numberOfBathrooms,
  numberOfFloors,
  layoutIntent,
  styleMood,
  furnitureDensity,
  lightingMood,
  hasBalcony,
  pro3dMode,
  showFurniture,
  aiLayout,
}: Required<PlannerProps> & { aiLayout: AILayoutSuggestion | null }) {
  const safeLength = toSafeDimension(length, 14)
  const safeWidth = toSafeDimension(width, 11)
  const wallHeight = clamp(height, 2.6, 3.6)
  const floors = clamp(numberOfFloors, 1, 4)
  const roomCount = clamp(numberOfRooms, 1, 8)
  const bathCount = clamp(numberOfBathrooms, 1, 4)
  const wallColor = aiLayout?.palette.wall || wallPalette[wallType] || wallPalette.concrete_blocks
  const floorColor = aiLayout?.palette.floor || "#ddd3c2"
  const accentColor = aiLayout?.palette.accent || "#dce3e6"
  const openness = aiLayout?.openness ?? 0.55
  const lightingMoodFinal = aiLayout?.lighting || lightingMood || "neutral"
  const furnitureDensityFinal = aiLayout?.furniture?.density || furnitureDensity || "balanced"
  const furnitureTone = aiLayout?.furniture?.tone || "light"
  const floorMaterial = aiLayout?.surfaces?.floorMaterial || "light_wood"
  const accentMaterial = aiLayout?.surfaces?.accentMaterial || "wood"
  const layoutIntentFinal = layoutIntent || "balanced"
  const hasBalconyFinal = hasBalcony ?? true
  const wallThickness = 0.18
  const advanced = estimationMode === "advanced"
  const floorRoughness = floorMaterial === "stone" ? 0.65 : floorMaterial === "concrete" ? 0.52 : floorMaterial === "tile" ? 0.58 : 0.82
  const isProMode = pro3dMode ?? false
  const renderFurniture = showFurniture ?? true
  const lightingProfile = {
    bright: { ambient: 0.92, hemi: 0.64, directional: 1.6, spot: 0.95 },
    neutral: { ambient: 0.74, hemi: 0.5, directional: 1.35, spot: 0.78 },
    cozy: { ambient: 0.62, hemi: 0.46, directional: 1.12, spot: 0.64 },
  }[lightingMoodFinal]
  const lightBoost = isProMode ? 1.08 : 1
  const sofaBase = furnitureTone === "dark" ? "#60646b" : furnitureTone === "mixed" ? "#6b6f75" : "#727881"
  const sofaCushion = furnitureTone === "dark" ? "#7a7f88" : furnitureTone === "mixed" ? "#8a9198" : "#8d949d"

  const layout = useMemo(() => {
    return buildPlanLayout({
      safeLength,
      safeWidth,
      wallHeight,
      wallThickness,
      wallColor,
      aiLayout,
      openness,
      layoutIntent: layoutIntentFinal,
      hasBalcony: hasBalconyFinal,
    })
  }, [safeLength, safeWidth, wallHeight, wallThickness, wallColor, aiLayout, openness, layoutIntentFinal, hasBalconyFinal])

  const visibleBedrooms = Math.min(layout.bedrooms.length, Math.max(1, roomCount - 2))
  const visibleBathrooms = Math.min(layout.baths.length, bathCount)

  return (
    <>
      <color attach="background" args={["#d6dbe1"]} />
      <ambientLight intensity={lightingProfile.ambient * lightBoost} />
      <hemisphereLight intensity={lightingProfile.hemi * lightBoost} color="#ffffff" groundColor="#b9c0c9" />
      <directionalLight
        castShadow
        intensity={lightingProfile.directional * lightBoost}
        position={[10, 16, 10]}
        shadow-mapSize-width={isProMode ? 2048 : 1024}
        shadow-mapSize-height={isProMode ? 2048 : 1024}
      />
      <spotLight castShadow intensity={lightingProfile.spot * lightBoost} angle={0.5} penumbra={0.6} position={[-9, 15, 4]} />

      <group position={[0, 0, 0]}>
        <FloorPanel width={safeLength} depth={safeWidth} color={floorColor} roughness={floorRoughness} />
        {hasBalconyFinal && <FloorPanel width={layout.patio.width} depth={layout.patio.depth} color="#b7b8b3" position={[layout.patio.x, 0.01, layout.patio.z]} />}

        {layout.outerWalls.map((wall, index) => <Wall key={`outer-${index}`} {...wall} />)}
        {projectType !== "foundation" && layout.interiorWalls.map((wall, index) => <Wall key={`inner-${index}`} {...wall} />)}

        {layout.windows.map((pane, index) => (
          <group key={`window-${index}`}>
            <GlassPanel {...pane} />
            <Frame position={[pane.position[0], pane.position[1] + pane.size[1] / 2 - 0.04, pane.position[2]]} size={[pane.size[0], 0.06, pane.size[2] + 0.02]} />
          </group>
        ))}

        <Frame position={[safeLength / 2 - 0.02, 1.05, 1.2]} size={[0.05, 2.1, 1.4]} />
        <GlassPanel position={[safeLength / 2 - 0.04, 1.02, 1.2]} size={[0.04, 1.9, 1.2]} />
        <Frame position={[0.55, 1.05, safeWidth / 2 - 0.04]} size={[1.6, 2.1, 0.05]} />
        <GlassPanel position={[0.55, 1.02, safeWidth / 2 - 0.06]} size={[1.35, 1.9, 0.04]} />

        {projectType !== "wall" && projectType !== "roof" && projectType !== "foundation" && renderFurniture && (
          <>
            {isProMode ? (
              <>
                <KenneyKitchen
                  position={[layout.kitchen.x - 1.25, 0, layout.kitchen.z + 0.2]}
                  scale={clamp(layout.kitchen.width / 5.2, 0.85, 1.25)}
                />
                {(aiLayout?.features.islandKitchen ?? layoutIntentFinal !== "zoned") && (
                  <KenneyKitchenIsland
                    position={[layout.kitchen.x + 0.5, 0, layout.kitchen.z + 2.1]}
                    scale={clamp(layout.kitchen.width / 5.6, 0.85, 1.2)}
                  />
                )}
                <KenneyDiningSet
                  position={[layout.dining.x, 0, layout.dining.z]}
                  scale={clamp(layout.dining.width / 3.2, 0.8, 1.2)}
                />
                <KenneyLivingSet
                  position={[layout.living.x, 0, layout.living.z]}
                  rotation={[0, getZoneRotation(layout.living), 0]}
                  scale={getZoneScale(layout.living, 3.4)}
                />

                {layout.bedrooms.slice(0, visibleBedrooms).map((zone, index) => (
                  <group key={`bedroom-${index}`}>
                    <KenneyBedroomSet
                      position={[zone.x, 0, zone.z]}
                      rotation={[0, getZoneRotation(zone), 0]}
                      scale={getZoneScale(zone, 2.6)}
                    />
                  </group>
                ))}

                {layout.baths.slice(0, visibleBathrooms).map((zone, index) => (
                  <KenneyBathroomSet
                    key={`bath-${index}`}
                    position={[zone.x, 0, zone.z]}
                    rotation={[0, getZoneRotation(zone), 0]}
                    scale={getZoneScale(zone, 2.1)}
                  />
                ))}

                {hasBalconyFinal && (
                  <KenneyPatioSet position={[layout.patio.x, 0, layout.patio.z]} scale={clamp(layout.patio.width / 2.6, 0.7, 1.2)} />
                )}
              </>
            ) : (
              <>
                <KitchenSuite
                  position={[layout.kitchen.x, 0, layout.kitchen.z]}
                  width={layout.kitchen.width}
                  advanced={advanced}
                  island={aiLayout?.features.islandKitchen ?? layoutIntentFinal !== "zoned"}
                />
                <DiningSet position={[layout.dining.x, 0, layout.dining.z]} />

                <Rug position={[layout.living.x, 0.04, layout.living.z]} size={[2.8, 0.02, 2.1]} color={accentColor} />
                <Sofa position={[layout.living.x - 0.1, 0, layout.living.z + 0.3]} baseColor={sofaBase} cushionColor={sofaCushion} />
                <Sofa position={[layout.living.x - 1.32, 0, layout.living.z + 1.05]} rotation={Math.PI / 2} baseColor={sofaBase} cushionColor={sofaCushion} />
                <CoffeeTable position={[layout.living.x + 0.1, 0, layout.living.z + 0.95]} />
                {furnitureDensityFinal !== "minimal" && (
                  <SideTable position={[layout.living.x + 1.35, 0, layout.living.z + 0.2]} diameter={0.42} />
                )}
                {isProMode && (
                  <TVConsole position={[layout.living.x + 2.35, 0.22, layout.living.z - 1.1]} />
                )}

                {aiLayout?.features.extraStorage && isProMode && (
                  <Wardrobe position={[layout.living.x + 2, 0.95, layout.living.z - 1.5]} rotation={Math.PI / 2} />
                )}

                {layout.bedrooms.slice(0, visibleBedrooms).map((zone, index) => (
                  <group key={`bedroom-${index}`}>
                    <Bed position={[zone.x, 0, zone.z]} king={index === 1} />
                    <Wardrobe position={[zone.x + zone.width / 2 - 0.58, 0.95, zone.z - zone.depth / 2 + 0.45]} />
                    {furnitureDensityFinal !== "minimal" && (
                      <>
                        <SideTable position={[zone.x - 0.65, 0, zone.z - 0.2]} diameter={0.36} />
                        <SideTable position={[zone.x + 0.65, 0, zone.z - 0.2]} diameter={0.36} />
                      </>
                    )}
                  </group>
                ))}

                {layout.baths.slice(0, visibleBathrooms).map((zone, index) => (
                  <BathroomSet key={`bath-${index}`} position={[zone.x, 0, zone.z]} compact={index === 1} />
                ))}

                {hasBalconyFinal && (
                  <>
                    <Plant position={[layout.patio.x - 0.95, 0, layout.patio.z + 0.25]} scale={1.1} />
                    <Plant position={[layout.patio.x + 0.95, 0, layout.patio.z + 0.1]} scale={1.05} />
                    {furnitureDensityFinal === "cozy" && (
                      <>
                        <Plant position={[layout.patio.x, 0, layout.patio.z - 0.6]} scale={0.9} />
                        <SideTable position={[layout.patio.x + 0.4, 0, layout.patio.z + 0.1]} diameter={0.34} />
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        {floors > 1 && (
          <>
            <RoundedBox args={[safeLength * 0.92, 0.06, safeWidth * 0.92]} radius={0.02} smoothness={2} position={[0, wallHeight + 0.15, 0]} receiveShadow>
              <meshStandardMaterial color="#dbe0e5" transparent opacity={0.45} roughness={0.35} />
            </RoundedBox>
            <StairBlock position={[-safeLength / 2 + 1.4, 0, 0.95]} />
          </>
        )}

        {hasElectricity && advanced && (
          <RoundedBox args={[safeLength * 0.32, 0.04, 0.04]} radius={0.01} smoothness={2} position={[0.3, wallHeight - 0.35, -safeWidth / 2 + 0.52]} castShadow>
            <meshStandardMaterial color="#f0bb57" emissive="#8f6516" emissiveIntensity={0.22} />
          </RoundedBox>
        )}

        {hasPlumbing && (
          <RoundedBox args={[safeLength * 0.22, 0.06, 0.06]} radius={0.01} smoothness={2} position={[safeLength / 2 - 2.1, 0.1, 0.12]} castShadow>
            <meshStandardMaterial color="#4e9fd6" emissive="#1c557f" emissiveIntensity={0.16} />
          </RoundedBox>
        )}

        {projectType === "roof" && (
          <group position={[0, 0.2, 0]}>
            <RoundedBox args={[safeLength * 0.92, 0.12, safeWidth * 0.92]} radius={0.04} smoothness={3} castShadow receiveShadow>
              <meshStandardMaterial color="#7f8a94" roughness={0.72} />
            </RoundedBox>
            {roofType !== "flat" && (
              <mesh position={[0, 0.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
                <coneGeometry args={[Math.max(safeLength, safeWidth) * 0.34, roofType === "mansard" ? 0.82 : 0.62, 4]} />
                <meshStandardMaterial color="#717c87" roughness={0.66} />
              </mesh>
            )}
          </group>
        )}
      </group>

      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={safeLength * 1.4} blur={2.4} far={12} />
      <OrbitControls enablePan enableZoom enableRotate minDistance={8} maxDistance={28} maxPolarAngle={Math.PI / 2.04} target={[0, 0.8, 0.6]} />
    </>
  )
}

function Plan2DView({ planner, aiLayout }: { planner: Required<PlannerProps>; aiLayout: AILayoutSuggestion | null }) {
  const safeLength = toSafeDimension(planner.length, 14)
  const safeWidth = toSafeDimension(planner.width, 11)
  const wallHeight = clamp(planner.height, 2.6, 3.6)
  const wallColor = aiLayout?.palette.wall || wallPalette[planner.wallType] || wallPalette.concrete_blocks
  const openness = aiLayout?.openness ?? 0.55
  const layoutIntentFinal = planner.layoutIntent || "balanced"
  const hasBalconyFinal = planner.hasBalcony ?? true
  const wallThickness = 0.18

  const layout = useMemo(() => {
    return buildPlanLayout({
      safeLength,
      safeWidth,
      wallHeight,
      wallThickness,
      wallColor,
      aiLayout,
      openness,
      layoutIntent: layoutIntentFinal,
      hasBalcony: hasBalconyFinal,
    })
  }, [safeLength, safeWidth, wallHeight, wallThickness, wallColor, aiLayout, openness, layoutIntentFinal, hasBalconyFinal])

  const offsetX = safeLength / 2
  const offsetZ = safeWidth / 2
  const viewBox = `0 0 ${safeLength} ${safeWidth}`
  const wallFill = "#2b2b2b"
  const interiorFill = "#f7f5ef"
  const glazing = "#8bbad1"

  const mapRect = (segment: Segment) => {
    const [x, , z] = segment.position
    const [w, , d] = segment.size
    return {
      x: x - w / 2 + offsetX,
      y: z - d / 2 + offsetZ,
      width: w,
      height: d,
    }
  }

  const zoneLabel = (label: string, zone: Zone) => (
    <text key={label} x={zone.x + offsetX} y={zone.z + offsetZ} textAnchor="middle" fontSize={0.55} fill="#5b5b5b">
      {label}
    </text>
  )

  return (
    <svg viewBox={viewBox} className="h-full w-full bg-[#fefaf2]">
      <rect x={0} y={0} width={safeLength} height={safeWidth} fill={interiorFill} />

      {layout.outerWalls.map((wall, index) => {
        const rect = mapRect(wall)
        return <rect key={`outer-${index}`} {...rect} fill={wallFill} />
      })}

      {planner.projectType !== "foundation" && layout.interiorWalls.map((wall, index) => {
        const rect = mapRect(wall)
        return <rect key={`inner-${index}`} {...rect} fill={wallFill} opacity={0.9} />
      })}

      {layout.windows.map((pane, index) => {
        const rect = mapRect(pane)
        return <rect key={`window-${index}`} {...rect} fill={glazing} opacity={0.85} />
      })}

      {zoneLabel("Kitchen", layout.kitchen)}
      {zoneLabel("Dining", layout.dining)}
      {zoneLabel("Living", layout.living)}
      {layout.bedrooms.slice(0, Math.max(1, (planner.numberOfRooms || 3) - 2)).map((zone, index) => zoneLabel(`Bed ${index + 1}`, zone))}
      {layout.baths.slice(0, Math.max(1, planner.numberOfBathrooms || 1)).map((zone, index) => zoneLabel(`Bath ${index + 1}`, zone))}
      {hasBalconyFinal && zoneLabel("Patio", layout.patio)}
    </svg>
  )
}

export function Estimation3DPlanner(props: PlannerProps) {
  const plannerProps: Required<PlannerProps> = {
    projectType: props.projectType || "house",
    estimationMode: props.estimationMode || "advanced",
    length: toSafeDimension(props.length, 14),
    width: toSafeDimension(props.width, 11),
    height: clamp(props.height || 3, 2.6, 3.6),
    wallType: props.wallType || "concrete_blocks",
    roofType: props.roofType || "flat",
    hasPlumbing: props.hasPlumbing ?? true,
    hasElectricity: props.hasElectricity ?? true,
    numberOfRooms: clamp(props.numberOfRooms || 4, 1, 8),
    numberOfBathrooms: clamp(props.numberOfBathrooms || 2, 1, 4),
    numberOfFloors: clamp(props.numberOfFloors || 1, 1, 4),
    layoutIntent: props.layoutIntent || "balanced",
    styleMood: props.styleMood || "modern",
    furnitureDensity: props.furnitureDensity || "balanced",
    lightingMood: props.lightingMood || "neutral",
    hasBalcony: props.hasBalcony ?? true,
    pro3dMode: props.pro3dMode ?? false,
    showFurniture: props.showFurniture ?? true,
  }

  const [aiLayout, setAiLayout] = useState<AILayoutSuggestion | null>(null)
  const [isGeneratingLayout, setIsGeneratingLayout] = useState(false)
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d")
  const { active: isLoadingModels, progress: modelProgress } = useProgress()

  useEffect(() => {
    const controller = new AbortController()
    let mounted = true
    let debounceTimer: ReturnType<typeof setTimeout> | undefined

    const generateLayout = async () => {
      try {
        setIsGeneratingLayout(true)
        const response = await fetch('/api/ai-layout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(plannerProps),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('AI layout request failed')
        }

        const data = await response.json()
        if (mounted && data?.layout) {
          setAiLayout(data.layout)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to generate AI layout:', error)
        }
      } finally {
        if (mounted) {
          setIsGeneratingLayout(false)
        }
      }
    }

    debounceTimer = setTimeout(() => {
      void generateLayout()
    }, 450)

    return () => {
      mounted = false
      controller.abort()
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [
    plannerProps.projectType,
    plannerProps.estimationMode,
    plannerProps.length,
    plannerProps.width,
    plannerProps.height,
    plannerProps.wallType,
    plannerProps.roofType,
    plannerProps.hasPlumbing,
    plannerProps.hasElectricity,
    plannerProps.numberOfRooms,
    plannerProps.numberOfBathrooms,
    plannerProps.numberOfFloors,
    plannerProps.layoutIntent,
    plannerProps.styleMood,
    plannerProps.furnitureDensity,
    plannerProps.lightingMood,
    plannerProps.hasBalcony,
  ])

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-lg">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <Sparkles className="h-5 w-5 text-primary" />
            Architectural Preview
          </CardTitle>
          <div className="flex items-center gap-2 rounded-full border border-border bg-background/80 p-1">
            <Button
              type="button"
              size="sm"
              variant={viewMode === "3d" ? "default" : "ghost"}
              onClick={() => setViewMode("3d")}
            >
              3D View
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === "2d" ? "default" : "ghost"}
              onClick={() => setViewMode("2d")}
            >
              2D Plan
            </Button>
          </div>
        </div>
        <CardDescription>
          {viewMode === "3d"
            ? "AI-generated cutaway plan from your estimator choices, with adaptive interior zoning, furniture, bathrooms, glazing, and services."
            : "Professional 2D architect plan with zoning, walls, and openings based on your estimator inputs."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-3 text-xs text-muted-foreground">
          {isGeneratingLayout
            ? 'Generating AI layout...'
            : aiLayout?.generatedByAI
              ? `AI layout ready (${aiLayout.style} style).`
              : 'Using smart fallback layout.'}
        </div>
        <div className="relative h-[520px] overflow-hidden rounded-2xl border-2 border-border bg-gradient-to-br from-slate-200 to-slate-300">
          {viewMode === "3d" && isLoadingModels && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="rounded-2xl border border-border bg-white/90 px-6 py-4 text-center shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Loading 3D Assets</p>
                <p className="mt-2 text-sm font-medium text-secondary">{Math.round(modelProgress)}% ready</p>
                <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${Math.round(modelProgress)}%` }} />
                </div>
              </div>
            </div>
          )}
          {viewMode === "3d" ? (
            <Canvas shadows camera={{ position: [11, 11.5, 9.5], fov: 34 }}>
              <PlanScene {...plannerProps} aiLayout={aiLayout} />
            </Canvas>
          ) : (
            <Plan2DView planner={plannerProps} aiLayout={aiLayout} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
