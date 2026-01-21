"use client"

import { Star } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

export function TestimonialsSection() {
  const { t } = useLocale()

  const testimonials = [
    {
      name: t('testimonials.testimonial1Name'),
      role: t('testimonials.testimonial1Role'),
      company: t('testimonials.testimonial1Company'),
      content: t('testimonials.testimonial1Content'),
      rating: 5,
    },
    {
      name: t('testimonials.testimonial2Name'),
      role: t('testimonials.testimonial2Role'),
      company: t('testimonials.testimonial2Company'),
      content: t('testimonials.testimonial2Content'),
      rating: 5,
    },
    {
      name: t('testimonials.testimonial3Name'),
      role: t('testimonials.testimonial3Role'),
      company: t('testimonials.testimonial3Company'),
      content: t('testimonials.testimonial3Content'),
      rating: 5,
    },
  ]

  return (
    <section className="bg-muted py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            {t('testimonials.badge')}
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-secondary md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            {t('testimonials.title')}
          </h2>
          <p className="text-pretty text-muted-foreground">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-xl border-2 border-border bg-card p-6 shadow-sm"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <p className="mb-6 text-muted-foreground">
                &quot;{testimonial.content}&quot;
              </p>

              {/* Author */}
              <div>
                <p className="font-semibold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                  {testimonial.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
