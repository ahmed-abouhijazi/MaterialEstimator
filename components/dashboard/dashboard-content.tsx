"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
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
  Download,
  LogOut,
  User as UserIcon
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/currency"

interface Estimate {
  id: string
  projectName: string
  location: string
  currency: string
  totalCost: number
  materialCost: number
  laborCost: number
  createdAt: string
}

export function DashboardContent() {
  const { data: session, status } = useSession()
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEstimates()
    } else if (status === 'unauthenticated') {
      setIsLoaded(true)
    }
  }, [status])

  const fetchEstimates = async () => {
    try {
      const response = await fetch('/api/estimates')
      if (response.ok) {
        const data = await response.json()
        setEstimates(data.estimates || [])
      }
    } catch (error) {
      console.error('Failed to fetch estimates:', error)
    } finally {
      setIsLoaded(true)
    }
  }

  const deleteEstimate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this estimate?')) return

    try {
      const response = await fetch(`/api/estimates?id=${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setEstimates(estimates.filter(e => e.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete estimate:', error)
    }
  }

  const stats = {
    totalProjects: estimates.length,
    totalValue: estimates.reduce((sum, e) => sum + e.totalCost, 0),
    avgProjectCost: estimates.length > 0 
      ? estimates.reduce((sum, e) => sum + e.totalCost, 0) / estimates.length 
      : 0,
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <FolderOpen className="mx-auto h-12 w-12 animate-pulse text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <Card className="border-2 border-border">
          <CardContent className="py-12">
            <UserIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Welcome to BuildCalc Pro</h2>
            <p className="text-muted-foreground mb-6">
              Sign in to save your estimates and access them from anywhere
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button>Log In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline">Sign Up</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome back, {session.user?.name || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Manage and track all your construction estimates
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/estimator">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Estimate
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <UserIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{session.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session.user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
            Saved Estimates
          </CardTitle>
          <CardDescription>
            Your saved construction estimates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {estimates.length === 0 ? (
            <div className="py-12 text-center">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                No estimates yet
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
              {estimates.map((estimate) => (
                <div
                  key={estimate.id}
                  className="flex flex-col gap-4 rounded-lg border-2 border-border p-4 transition-colors hover:border-primary/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Calculator className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                        {estimate.projectName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {estimate.location}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(estimate.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="text-lg font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>
                        {formatCurrency(estimate.totalCost, estimate.currency)}
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
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => deleteEstimate(estimate.id)}
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
