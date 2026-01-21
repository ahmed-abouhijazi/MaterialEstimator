"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

type LocaleContextType = {
  locale: string
  currency: string
  country: string
  setLocale: (locale: string) => void
  setCurrency: (currency: string) => void
  setCountry: (country: string) => void
  t: (key: string) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

// Country to currency mapping
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  'FR': 'EUR',
  'MA': 'MAD',
  'US': 'USD',
  'GB': 'GBP',
  'CA': 'CAD',
  'AU': 'AUD',
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [locale, setLocaleState] = useState('en')
  const [currency, setCurrencyState] = useState('USD')
  const [country, setCountryState] = useState('US')
  const [translations, setTranslations] = useState<any>({})

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const messages = await import(`@/messages/${locale}.json`)
        setTranslations(messages.default)
      } catch (error) {
        console.error('Failed to load translations:', error)
      }
    }
    loadTranslations()
  }, [locale])

  // Load user preferences from session
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const fetchPreferences = async () => {
        try {
          const response = await fetch('/api/user/preferences')
          if (response.ok) {
            const data = await response.json()
            setLocaleState(data.preferredLanguage || 'en')
            setCurrencyState(data.preferredCurrency || 'USD')
            setCountryState(data.preferredCountry || 'US')
          }
        } catch (error) {
          console.error('Failed to fetch preferences:', error)
        }
      }
      fetchPreferences()
    }
  }, [session, status])

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('currency', newCurrency)
  }

  const setCountry = (newCountry: string) => {
    setCountryState(newCountry)
    // Auto-set currency based on country
    const autoCurrency = COUNTRY_CURRENCY_MAP[newCountry] || 'USD'
    setCurrencyState(autoCurrency)
    
    // Auto-set language based on country
    if (newCountry === 'FR' || newCountry === 'MA') {
      setLocaleState('fr')
    } else {
      setLocaleState('en')
    }
    
    localStorage.setItem('country', newCountry)
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  return (
    <LocaleContext.Provider
      value={{
        locale,
        currency,
        country,
        setLocale,
        setCurrency,
        setCountry,
        t,
      }}
    >
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return context
}
