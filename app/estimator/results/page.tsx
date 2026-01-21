import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ResultsDisplay } from "@/components/estimator/results-display"

export const metadata = {
  title: "Estimate Results - BuildCalc Pro",
  description: "Your material estimate is ready. View quantities, costs, and export your report.",
}

export default function ResultsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <ResultsDisplay />
        </div>
      </main>
      <Footer />
    </div>
  )
}
