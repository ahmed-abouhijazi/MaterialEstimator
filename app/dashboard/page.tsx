import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export const metadata = {
  title: "Dashboard - BuildCalc Pro",
  description: "Manage your construction estimates, view project history, and track material costs.",
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <DashboardContent />
        </div>
      </main>
      <Footer />
    </div>
  )
}
