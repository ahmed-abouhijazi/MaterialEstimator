const steps = [
  {
    number: "01",
    title: "Enter Project Details",
    description: "Select your project type, enter dimensions, location, and choose your quality level. It takes less than 2 minutes.",
  },
  {
    number: "02",
    title: "Get Your Material List",
    description: "Our formula engine calculates exact quantities for every material - cement, steel, sand, aggregates, and more.",
  },
  {
    number: "03",
    title: "Review Cost Estimate",
    description: "See the estimated cost breakdown with waste buffer included. Adjust quality level to compare options.",
  },
  {
    number: "04",
    title: "Export & Share",
    description: "Download your estimate as PDF or share directly with suppliers and team members via WhatsApp or email.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            How It Works
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-secondary md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            From Project to Estimate in Minutes
          </h2>
          <p className="text-pretty text-muted-foreground">
            No complex software. No learning curve. Just enter your details and get results.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-0 hidden h-full w-0.5 bg-border md:left-1/2 md:block md:-translate-x-1/2" />

            <div className="space-y-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col gap-4 md:flex-row md:gap-8 ${
                    index % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Number Circle */}
                  <div className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-card text-lg font-bold text-primary md:left-1/2 md:-translate-x-1/2" style={{ fontFamily: 'var(--font-display)' }}>
                    {step.number}
                  </div>

                  {/* Content */}
                  <div className={`ml-16 rounded-xl border-2 border-border bg-card p-6 md:ml-0 md:w-[calc(50%-2rem)] ${
                    index % 2 === 1 ? "md:mr-auto" : "md:ml-auto"
                  }`}>
                    <h3 className="mb-2 text-lg font-semibold text-secondary" style={{ fontFamily: 'var(--font-display)' }}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
