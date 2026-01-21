"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  FolderOpen, 
  Calculator, 
  TrendingUp, 
  Calendar,
  MoreVertical,
  Trash2,
  Eye,
  Download
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type EstimateResult, getProjectTypeLabel } from "@/lib/calculations"

// Demo projects for showcase (in a real app, these would come from a database)
const demoProjects: EstimateResult[] = [
  {
    projectId: "BC-DEMO-001",
    projectDetails: {
      projectType: "house",
      length: 12,
      width: 10,
      height: 3,
      location: "United States - Southwest",
      qualityLevel: "standard",
    },
    materials: [],
    subtotal: 45250,
    wasteBuffer: 5430,
    wasteBufferPercentage: 12,
    total: 50680,
    generatedAt: new Date("2026-01-15"),
  },
  {
    projectId: "BC-DEMO-002",
    projectDetails: {
      projectType: "room",
      length: 5,
      width: 4,
      height: 2.8,
      location: "United States - Northeast",
      qualityLevel: "premium",
    },
    materials: [],
    subtotal: 8500,
    wasteBuffer: 850,
    wasteBufferPercentage: 10,
    total: 9350,
    generatedAt: new Date("2026-01-18"),
  },
  {
    projectId: "BC-DEMO-003",
    projectDetails: {
      projectType: "renovation",
      length: 8,
      width: 6,
      height: 2.5,
      location: "Canada",
      qualityLevel: "standard",
    },
    materials: [],
    subtotal: 12800,
    wasteBuffer: 1920,
    wasteBufferPercentage: 15,
    total: 14720,
    generatedAt: new Date("2026-01-20"),
  },
]

export function DashboardContent() {
  const [projects, setProjects] = useState<EstimateResult[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load saved projects from localStorage
    const savedProjects = localStorage.getItem("buildcalc_projects")
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects)
        setProjects(parsed.map((p: EstimateResult) => ({
          ...p,
          generatedAt: new Date(p.generatedAt),
        })))
      } catch (e) {
        console.error("Failed to load projects:", e)
        setProjects(demoProjects)
      }
    } else {
      // Use demo projects for first-time users
      setProjects(demoProjects)
    }
    setIsLoaded(true)
  }, [])

  const deleteProject = (projectId: string) => {
    const updated = projects.filter((p) => p.projectId !== projectId)
    setProjects(updated)
    localStorage.setItem("buildcalc_projects", JSON.stringify(updated))
  }

  const stats = {
    totalProjects: projects.length,
    totalValue: projects.reduce((sum, p) => sum + p.total, 0),
    avgProjectCost: projects.length > 0 
      ? projects.reduce((sum, p) => sum + p.total, 0) / projects.length 
      : 0,
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <FolderOpen className="mx-auto h-12 w-12 animate-pulse text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage and track all your construction estimates
          </p>
        </div>
        <Link href="/estimator">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Estimate
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="border-2 border-border">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                {stats.totalProjects}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-border">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Estimated Value</p>
              <p className="text-2xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                ${stats.totalValue.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-border">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Project Cost</p>
              <p className="text-2xl font-bold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                ${Math.round(stats.avgProjectCost).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="text-lg text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
            Recent Projects
          </CardTitle>
          <CardDescription>
            Your saved estimates and calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="py-12 text-center">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                No projects yet
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first estimate to see it here
              </p>
              <Link href="/estimator" className="mt-4 inline-block">
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Estimate
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.projectId}
                  className="flex flex-col gap-4 rounded-lg border-2 border-border p-4 transition-colors hover:border-primary/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Calculator className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                        {getProjectTypeLabel(project.projectDetails.projectType)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {project.projectDetails.length}m x {project.projectDetails.width}m | {project.projectDetails.location}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {project.generatedAt.toLocaleDateString()}
                        <span className="text-muted-foreground/50">|</span>
                        <span className="font-mono">{project.projectId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="text-lg font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>
                        ${project.total.toLocaleString()}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => deleteProject(project.projectId)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <div className="mt-8 rounded-xl border-2 border-border bg-muted p-6">
        <h3 className="mb-4 font-semibold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
          Pro Tips
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              1
            </div>
            <p className="text-sm text-muted-foreground">
              Always add 10-15% extra materials for unexpected needs. Our estimates include a waste buffer.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              2
            </div>
            <p className="text-sm text-muted-foreground">
              Compare quotes from at least 3 suppliers before purchasing materials.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              3
            </div>
            <p className="text-sm text-muted-foreground">
              Use the Premium quality level for areas with high traffic or exposure to weather.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              4
            </div>
            <p className="text-sm text-muted-foreground">
              Download and share your estimates with suppliers to get accurate pricing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
