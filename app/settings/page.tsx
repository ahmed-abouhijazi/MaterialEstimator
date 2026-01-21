import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SettingsContent } from "@/components/settings/settings-content"

export const metadata = {
  title: "Settings - BuildCalc Pro",
  description: "Manage your account settings, preferences, and profile information.",
}

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <SettingsContent />
        </div>
      </main>
      <Footer />
    </div>
  )
}
