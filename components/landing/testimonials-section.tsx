import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Marcus Rodriguez",
    role: "General Contractor",
    company: "Rodriguez Construction",
    content: "Used to spend hours calculating materials by hand. Now I get accurate estimates in minutes. Saved me from ordering mistakes twice already.",
    rating: 5,
  },
  {
    name: "Sarah Chen",
    role: "Project Manager",
    company: "Homestead Renovations",
    content: "The waste buffer feature is a lifesaver. No more emergency runs to the supplier in the middle of a job. My clients love the professional PDF reports.",
    rating: 5,
  },
  {
    name: "David Okonkwo",
    role: "Independent Builder",
    company: "Self-employed",
    content: "Finally, a tool that speaks my language. No fancy tech jargon, just tell me what I need and how much it costs. Worth every penny.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-muted py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            Testimonials
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-secondary md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            Trusted by Contractors Like You
          </h2>
          <p className="text-pretty text-muted-foreground">
            Real builders sharing their experience with BuildCalc Pro.
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
