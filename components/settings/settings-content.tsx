"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useLocale } from "@/lib/locale-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Globe, DollarSign, MapPin, User, CheckCircle, AlertCircle } from "lucide-react"

export function SettingsContent() {
  const { data: session } = useSession()
  const { locale, currency, country, setLocale, setCurrency, setCountry, t } = useLocale()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    language: 'en',
    currency: 'USD',
    country: 'US',
  })

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user) return
      
      try {
        setIsFetching(true)
        const response = await fetch('/api/user/preferences')
        if (response.ok) {
          const data = await response.json()
          setFormData({
            name: session.user.name || '',
            email: session.user.email || '',
            language: data.preferredLanguage || locale,
            currency: data.preferredCurrency || currency,
            country: data.preferredCountry || country,
          })
          // Update context with fetched data
          setLocale(data.preferredLanguage || locale)
          setCurrency(data.preferredCurrency || currency)
          setCountry(data.preferredCountry || country)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchUserProfile()
  }, [session])

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }))
    }
  }, [session])

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      language: locale,
      currency: currency,
      country: country,
    }))
  }, [locale, currency, country])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredLanguage: formData.language,
          preferredCurrency: formData.currency,
          preferredCountry: formData.country,
        }),
      })

      if (response.ok) {
        setLocale(formData.language)
        setCurrency(formData.currency)
        setCountry(formData.country)
        setMessage({ type: 'success', text: t('settings.success') })
      } else {
        setMessage({ type: 'error', text: t('settings.error') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('settings.error') })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCountryChange = (newCountry: string) => {
    setFormData(prev => ({ ...prev, country: newCountry }))
    
    // Auto-set currency based on country
    const currencyMap: Record<string, string> = {
      'FR': 'EUR',
      'MA': 'MAD',
      'US': 'USD',
      'GB': 'GBP',
      'CA': 'CAD',
      'AU': 'AUD',
    }
    
    const autoCurrency = currencyMap[newCountry] || 'USD'
    setFormData(prev => ({ ...prev, currency: autoCurrency }))
    
    // Auto-set language based on country
    if (newCountry === 'FR' || newCountry === 'MA') {
      setFormData(prev => ({ ...prev, language: 'fr' }))
    } else {
      setFormData(prev => ({ ...prev, language: 'en' }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-secondary">{t('settings.title')}</h1>
          <p className="text-muted-foreground">Manage your account preferences and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Information */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('settings.profile')}
            </CardTitle>
            <CardDescription>Your basic account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Contact support to change your name</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Contact support to change your email</p>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('settings.preferences')}
            </CardTitle>
            <CardDescription>Customize your language, currency, and regional settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('settings.country')}
              </Label>
              <Select
                value={formData.country}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">{t('common.countries.us')}</SelectItem>
                  <SelectItem value="FR">{t('common.countries.fr')}</SelectItem>
                  <SelectItem value="MA">{t('common.countries.ma')}</SelectItem>
                  <SelectItem value="GB">{t('common.countries.gb')}</SelectItem>
                  <SelectItem value="CA">{t('common.countries.ca')}</SelectItem>
                  <SelectItem value="AU">{t('common.countries.au')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Language and currency will auto-update based on your country
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {t('settings.language')}
              </Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t('settings.currency')}
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">{t('common.currency.usd')}</SelectItem>
                  <SelectItem value="EUR">{t('common.currency.eur')}</SelectItem>
                  <SelectItem value="MAD">{t('common.currency.mad')}</SelectItem>
                  <SelectItem value="GBP">{t('common.currency.gbp')}</SelectItem>
                  <SelectItem value="CAD">{t('common.currency.cad')}</SelectItem>
                  <SelectItem value="AUD">{t('common.currency.aud')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {message && (
          <div className={`flex items-center gap-2 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? t('settings.saving') : t('settings.saveChanges')}
        </Button>
      </form>
    </div>
  )
}
