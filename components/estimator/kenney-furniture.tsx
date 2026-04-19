"use client"

import React, { useMemo } from "react"
import { useGLTF } from "@react-three/drei"

const BASE_PATH = "/models/kenney-furniture-kit/Models/GLTF format"

const kenneyPath = (file: string) => encodeURI(`${BASE_PATH}/${file}`)

type ModelProps = {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
}

type SetProps = {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
}

function KenneyModel({ file, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: ModelProps & { file: string }) {
  const { scene } = useGLTF(kenneyPath(file))
  const cloned = useMemo(() => scene.clone(true), [scene])
  return <primitive object={cloned} position={position} rotation={rotation} scale={scale} />
}

export function KenneyKitchen({ position, rotation = [0, 0, 0], scale = 1 }: SetProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <KenneyModel file="kitchenCabinet.glb" position={[-0.6, 0, 0]} scale={0.95} />
      <KenneyModel file="kitchenCabinetDrawer.glb" position={[0.3, 0, 0]} scale={0.95} />
      <KenneyModel file="kitchenSink.glb" position={[1.1, 0, 0]} scale={0.95} />
      <KenneyModel file="kitchenStoveElectric.glb" position={[2, 0, 0]} scale={0.95} />
      <KenneyModel file="kitchenFridgeLarge.glb" position={[2.9, 0, 0]} scale={0.95} />
      <KenneyModel file="kitchenCabinetUpper.glb" position={[0.3, 1.05, -0.2]} scale={0.95} />
      <KenneyModel file="kitchenCabinetUpperDouble.glb" position={[1.5, 1.05, -0.2]} scale={0.95} />
      <KenneyModel file="kitchenCabinetUpperLow.glb" position={[-0.6, 1.05, -0.2]} scale={0.95} />
    </group>
  )
}

export function KenneyKitchenIsland({ position, rotation = [0, 0, 0], scale = 1 }: SetProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <KenneyModel file="kitchenBar.glb" position={[0, 0, 0]} scale={1} />
      <KenneyModel file="stoolBar.glb" position={[-0.7, 0, -0.55]} scale={0.9} />
      <KenneyModel file="stoolBar.glb" position={[0, 0, -0.55]} scale={0.9} />
      <KenneyModel file="stoolBar.glb" position={[0.7, 0, -0.55]} scale={0.9} />
    </group>
  )
}

export function KenneyDiningSet({ position, rotation = [0, 0, 0], scale = 1 }: SetProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <KenneyModel file="table.glb" position={[0, 0, 0]} scale={1.05} />
      <KenneyModel file="chairModernCushion.glb" position={[-0.9, 0, -0.5]} rotation={[0, Math.PI / 2, 0]} scale={0.95} />
      <KenneyModel file="chairModernCushion.glb" position={[0.9, 0, -0.5]} rotation={[0, -Math.PI / 2, 0]} scale={0.95} />
      <KenneyModel file="chairModernCushion.glb" position={[-0.9, 0, 0.5]} rotation={[0, Math.PI / 2, 0]} scale={0.95} />
      <KenneyModel file="chairModernCushion.glb" position={[0.9, 0, 0.5]} rotation={[0, -Math.PI / 2, 0]} scale={0.95} />
    </group>
  )
}

export function KenneyLivingSet({ position, rotation = [0, 0, 0], scale = 1 }: SetProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <KenneyModel file="loungeSofa.glb" position={[0, 0, 0]} rotation={[0, Math.PI, 0]} scale={1} />
      <KenneyModel file="loungeSofaCorner.glb" position={[-1.4, 0, 0.8]} rotation={[0, Math.PI / 2, 0]} scale={1} />
      <KenneyModel file="tableCoffee.glb" position={[0.4, 0, 0.9]} scale={1} />
      <KenneyModel file="sideTable.glb" position={[1.45, 0, -0.1]} scale={0.9} />
      <KenneyModel file="cabinetTelevision.glb" position={[2.25, 0, -1.1]} rotation={[0, Math.PI, 0]} scale={1} />
      <KenneyModel file="televisionModern.glb" position={[2.25, 0.75, -1.05]} rotation={[0, Math.PI, 0]} scale={0.9} />
      <KenneyModel file="rugRectangle.glb" position={[0.2, 0.02, 0.7]} scale={1.2} />
    </group>
  )
}

export function KenneyBedroomSet({ position, rotation = [0, 0, 0], scale = 1 }: SetProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <KenneyModel file="bedDouble.glb" position={[0, 0, 0]} rotation={[0, Math.PI, 0]} scale={1} />
      <KenneyModel file="sideTable.glb" position={[-0.95, 0, -0.2]} scale={0.75} />
      <KenneyModel file="sideTable.glb" position={[0.95, 0, -0.2]} scale={0.75} />
      <KenneyModel file="bookcaseClosedDoors.glb" position={[1.35, 0, 0.9]} rotation={[0, -Math.PI / 2, 0]} scale={0.95} />
    </group>
  )
}

export function KenneyBathroomSet({ position, rotation = [0, 0, 0], scale = 1 }: SetProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <KenneyModel file="bathroomCabinet.glb" position={[-0.45, 0, -0.35]} scale={0.9} />
      <KenneyModel file="bathroomSink.glb" position={[0.25, 0, -0.35]} scale={0.95} />
      <KenneyModel file="toilet.glb" position={[0.85, 0, -0.1]} scale={0.9} />
      <KenneyModel file="bathtub.glb" position={[-0.15, 0, 0.8]} rotation={[0, Math.PI, 0]} scale={0.95} />
      <KenneyModel file="shower.glb" position={[0.85, 0, 0.7]} rotation={[0, Math.PI, 0]} scale={0.9} />
    </group>
  )
}

export function KenneyPatioSet({ position, rotation = [0, 0, 0], scale = 1 }: SetProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <KenneyModel file="pottedPlant.glb" position={[-0.6, 0, 0.1]} scale={0.85} />
      <KenneyModel file="pottedPlant.glb" position={[0.6, 0, -0.2]} scale={0.85} />
      <KenneyModel file="sideTable.glb" position={[0, 0, 0.4]} scale={0.7} />
    </group>
  )
}

useGLTF.preload(kenneyPath("kitchenCabinet.glb"))
useGLTF.preload(kenneyPath("kitchenCabinetDrawer.glb"))
useGLTF.preload(kenneyPath("kitchenSink.glb"))
useGLTF.preload(kenneyPath("kitchenStoveElectric.glb"))
useGLTF.preload(kenneyPath("kitchenFridgeLarge.glb"))
useGLTF.preload(kenneyPath("kitchenCabinetUpper.glb"))
useGLTF.preload(kenneyPath("kitchenCabinetUpperDouble.glb"))
useGLTF.preload(kenneyPath("kitchenCabinetUpperLow.glb"))
useGLTF.preload(kenneyPath("kitchenBar.glb"))
useGLTF.preload(kenneyPath("stoolBar.glb"))
useGLTF.preload(kenneyPath("table.glb"))
useGLTF.preload(kenneyPath("chairModernCushion.glb"))
useGLTF.preload(kenneyPath("loungeSofa.glb"))
useGLTF.preload(kenneyPath("loungeSofaCorner.glb"))
useGLTF.preload(kenneyPath("tableCoffee.glb"))
useGLTF.preload(kenneyPath("sideTable.glb"))
useGLTF.preload(kenneyPath("cabinetTelevision.glb"))
useGLTF.preload(kenneyPath("televisionModern.glb"))
useGLTF.preload(kenneyPath("rugRectangle.glb"))
useGLTF.preload(kenneyPath("bedDouble.glb"))
useGLTF.preload(kenneyPath("bookcaseClosedDoors.glb"))
useGLTF.preload(kenneyPath("bathroomCabinet.glb"))
useGLTF.preload(kenneyPath("bathroomSink.glb"))
useGLTF.preload(kenneyPath("toilet.glb"))
useGLTF.preload(kenneyPath("bathtub.glb"))
useGLTF.preload(kenneyPath("shower.glb"))
useGLTF.preload(kenneyPath("pottedPlant.glb"))
