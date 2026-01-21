import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { SessionProvider } from 'next-auth/react'
import { LocaleProvider } from '@/lib/locale-context'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'BuildCalc Pro - AI-Powered Construction Material Estimator',
    template: '%s | BuildCalc Pro'
  },
  description: 'Get accurate construction material estimates instantly. AI-powered calculations for houses, rooms, roofs, and more. Know exactly what materials you need and how much they cost.',
  keywords: [
    'construction estimator',
    'material calculator',
    'building cost estimator',
    'contractor tools',
    'construction materials',
    'cost estimation',
    'building calculator',
    'renovation estimator',
    'construction planning',
    'material quantities'
  ],
  authors: [{ name: 'BuildCalc Pro' }],
  creator: 'BuildCalc Pro',
  publisher: 'BuildCalc Pro',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'BuildCalc Pro - AI-Powered Construction Material Estimator',
    description: 'Get accurate construction material estimates instantly with AI-powered calculations',
    siteName: 'BuildCalc Pro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BuildCalc Pro - AI-Powered Construction Material Estimator',
    description: 'Get accurate construction material estimates instantly with AI-powered calculations',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e3a5f' },
    { media: '(prefers-color-scheme: dark)', color: '#1e3a5f' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <SessionProvider>
          <LocaleProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Analytics />
            </ThemeProvider>
          </LocaleProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
