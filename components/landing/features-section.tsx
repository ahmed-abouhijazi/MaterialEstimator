"use client"

import { Calculator, ClipboardList, Download, AlertTriangle, MapPin, Share2 } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

export function FeaturesSection() {
  const { t } = useLocale()

  const features = [
    {
      icon: ClipboardList,
      title: t('features.feature1Title'),
      description: t('features.feature1Desc'),
    },
    {
      icon: Calculator,
      title: t('features.feature2Title'),
      description: t('features.feature2Desc'),
    },
    {
      icon: AlertTriangle,
      title: t('features.feature3Title'),
      description: t('features.feature3Desc'),
    },
    {
      icon: MapPin,
      title: t('features.feature4Title'),
      description: t('features.feature4Desc'),
    },
    {
      icon: Download,
      title: t('features.feature5Title'),
      description: t('features.feature5Desc'),
    },
    {
      icon: Share2,
      title: t('features.feature6Title'),
      description: t('features.feature6Desc'),
    },
  ]

  return (
    <section className="bg-secondary py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            {t('features.badge')}
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-secondary-foreground md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            {t('features.title')}
          </h2>
          <p className="text-pretty text-secondary-foreground/80">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-xl border-2 border-secondary-foreground/20 bg-secondary-foreground/5 p-6 transition-all hover:border-primary hover:bg-secondary-foreground/10"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-secondary-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                {feature.title}
              </h3>
              <p className="text-sm text-secondary-foreground/70">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
