import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { EstimatorForm } from "@/components/estimator/estimator-form"

export const metadata = {
  title: "Material Estimator - BuildCalc Pro",
  description: "Get accurate material lists and cost estimates for your construction project in minutes.",
}

export default function EstimatorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <EstimatorForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
