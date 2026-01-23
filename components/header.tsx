"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useLocale } from "@/lib/locale-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, X, HardHat, LogOut, User, Settings, ShoppingCart, Package } from "lucide-react"
import { CartDrawer } from "@/components/cart/cart-drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const { data: session } = useSession()
  const { t } = useLocale()

  useEffect(() => {
    if (session) {
      fetchCartCount()
    }
  }, [session])

  const fetchCartCount = async () => {
    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        const count = data.reduce((sum: number, item: any) => sum + item.quantity, 0)
        setCartCount(count)
      }
    } catch (error) {
      console.error("Error fetching cart count:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-secondary bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
            <HardHat className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
            BuildCalc Pro
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/#shop" className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary">
            {t('nav.shop')}
          </Link>
          <Link href="/estimator" className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary">
            {t('nav.estimator')}
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary">
            {t('nav.dashboard')}
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary">
            {t('nav.pricing')}
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary">
            {t('nav.howItWorks')}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Button 
            variant="outline" 
            size="icon" 
            className="relative border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-secondary-foreground"
            onClick={() => setCartDrawerOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs">
                {cartCount}
              </Badge>
            )}
          </Button>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-secondary text-secondary bg-transparent">
                  <User className="mr-2 h-4 w-4" />
                  {session.user?.name || 'Account'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{session.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">{t('nav.dashboard')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('nav.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent">
                  {t('nav.signIn')}
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {t('nav.getStarted')}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-secondary md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t-2 border-secondary bg-background md:hidden">
          <nav className="container mx-auto flex flex-col gap-4 px-4 py-4">
            <Link
              href="/estimator"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.estimator')}
            </Link>
            <Link
              href="#shop"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.shop')}
            </Link>
            <Button
              variant="ghost"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary flex items-center gap-2 justify-start px-0"
              onClick={() => {
                setMobileMenuOpen(false)
                setCartDrawerOpen(true)
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              {t('nav.cart')}
              {cartCount > 0 && (
                <Badge className="bg-primary text-primary-foreground">
                  {cartCount}
                </Badge>
              )}
            </Button>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.dashboard')}
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.pricing')}
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.howItWorks')}
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              {session ? (
                <>
                  <div className="px-2 py-1.5 border rounded-md">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                  <Link href="/orders" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </Button>
                  </Link>
                  <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('nav.settings')}
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('nav.logOut')}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-secondary text-secondary bg-transparent">
                      {t('nav.signIn')}
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary text-primary-foreground">
                      {t('nav.getStarted')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      <CartDrawer 
        open={cartDrawerOpen} 
        onOpenChange={setCartDrawerOpen}
        onCartUpdate={fetchCartCount}
      />
    </header>
  )
}
