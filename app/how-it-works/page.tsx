import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HowItWorksContent } from "@/components/how-it-works/how-it-works-content"

export const metadata = {
  title: "How It Works - BuildCalc Pro",
  description: "Learn how BuildCalc Pro helps you estimate construction materials with accuracy and speed.",
}

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HowItWorksContent />
      </main>
      <Footer />
    </div>
  )
}
