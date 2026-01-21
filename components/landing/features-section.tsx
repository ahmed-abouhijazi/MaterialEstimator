import { Calculator, ClipboardList, Download, AlertTriangle, MapPin, Share2 } from "lucide-react"

const features = [
  {
    icon: ClipboardList,
    title: "Exact Material Lists",
    description: "Get detailed lists of cement, sand, steel, wood, wiring, pipes, and everything you need for your project.",
  },
  {
    icon: Calculator,
    title: "Precise Quantities",
    description: "Formula-based calculations, not AI guessing. We use proven construction math to get accurate numbers.",
  },
  {
    icon: AlertTriangle,
    title: "Waste Buffer Included",
    description: "Every estimate includes a 10-15% waste buffer so you never run short on materials mid-project.",
  },
  {
    icon: MapPin,
    title: "Local Material Suggestions",
    description: "Get material recommendations based on your location and local building standards.",
  },
  {
    icon: Download,
    title: "Downloadable Reports",
    description: "Export your estimates as PDF reports ready to share with suppliers or clients.",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share estimates via WhatsApp, email, or link with your team and material suppliers.",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-secondary py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            Features
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-secondary-foreground md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            Everything You Need to Estimate Right
          </h2>
          <p className="text-pretty text-secondary-foreground/80">
            Built for construction professionals who need reliable numbers, not fancy tech.
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
