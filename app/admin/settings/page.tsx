"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Bell,
  Shield,
  Palette,
  Database,
  CreditCard,
  Truck,
  Save,
  Camera,
  Key,
  Smartphone,
  Languages,
  Clock,
  DollarSign,
  Percent,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { useAuth } from "@/lib/admin/auth-context"

export default function SettingsPage() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  // Store settings state
  const [storeSettings, setStoreSettings] = useState({
    name: "BuildCalc Pro",
    email: "contact@buildcalcpro.ma",
    phone: "+212 5 22 XX XX XX",
    address: "123 Boulevard Mohammed V, Casablanca, Maroc",
    website: "https://buildcalcpro.ma",
    description: "Votre partenaire en matériaux de construction de qualité.",
    currency: "MAD",
    timezone: "Africa/Casablanca",
    language: "fr",
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowStock: true,
    newCustomers: false,
    dailyReport: true,
    weeklyReport: true,
    emailNotifications: true,
    smsNotifications: false,
  })

  // Tax & Shipping settings
  const [taxSettings, setTaxSettings] = useState({
    taxEnabled: true,
    taxRate: 20,
    taxIncluded: false,
    shippingEnabled: true,
    freeShippingThreshold: 1000,
    flatShippingRate: 50,
  })

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const getInitials = (name: string | null) => {
    if (!name) return "AD"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Paramètres</h1>
          <p className="text-slate-400">Configurez les paramètres de votre boutique</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les modifications
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700 flex-wrap h-auto p-1 w-full overflow-x-auto">
          <TabsTrigger value="general" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <Building2 className="h-4 w-4 mr-1 sm:mr-2 shrink-0" />
            <span className="truncate">Général</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <Shield className="h-4 w-4 mr-1 sm:mr-2 shrink-0" />
            <span className="truncate">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <Bell className="h-4 w-4 mr-1 sm:mr-2 shrink-0" />
            <span className="truncate">Notifs</span>
          </TabsTrigger>
          <TabsTrigger value="taxes" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <Percent className="h-4 w-4 mr-1 sm:mr-2 shrink-0" />
            <span className="truncate">Taxes</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="truncate">Informations de la boutique</span>
              </CardTitle>
              <CardDescription className="text-slate-400 truncate">
                Informations générales affichées sur votre boutique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-white" />
                  </div>
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">{storeSettings.name}</h3>
                  <p className="text-sm text-slate-400">Logo de la boutique</p>
                  <p className="text-xs text-slate-500">Format recommandé: PNG, 512x512px</p>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-300">Nom de la boutique</Label>
                  <Input
                    value={storeSettings.name}
                    onChange={(e) => setStoreSettings({ ...storeSettings, name: e.target.value })}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Site web</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      value={storeSettings.website}
                      onChange={(e) => setStoreSettings({ ...storeSettings, website: e.target.value })}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-300">Email de contact</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="email"
                      value={storeSettings.email}
                      onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      value={storeSettings.phone}
                      onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Adresse</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Textarea
                    value={storeSettings.address}
                    onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white resize-none min-h-[80px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Description</Label>
                <Textarea
                  value={storeSettings.description}
                  onChange={(e) => setStoreSettings({ ...storeSettings, description: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white resize-none min-h-[100px]"
                  placeholder="Décrivez votre activité..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Languages className="h-5 w-5 text-amber-500" />
                Paramètres régionaux
              </CardTitle>
              <CardDescription className="text-slate-400">
                Langue, devise et fuseau horaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-slate-300">Langue</Label>
                  <Select
                    value={storeSettings.language}
                    onValueChange={(value) => setStoreSettings({ ...storeSettings, language: value })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="fr" className="text-white focus:bg-slate-800">Français</SelectItem>
                      <SelectItem value="ar" className="text-white focus:bg-slate-800">العربية</SelectItem>
                      <SelectItem value="en" className="text-white focus:bg-slate-800">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Devise</Label>
                  <Select
                    value={storeSettings.currency}
                    onValueChange={(value) => setStoreSettings({ ...storeSettings, currency: value })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <DollarSign className="h-4 w-4 mr-2 text-slate-500" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="MAD" className="text-white focus:bg-slate-800">MAD - Dirham marocain</SelectItem>
                      <SelectItem value="EUR" className="text-white focus:bg-slate-800">EUR - Euro</SelectItem>
                      <SelectItem value="USD" className="text-white focus:bg-slate-800">USD - Dollar américain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Fuseau horaire</Label>
                  <Select
                    value={storeSettings.timezone}
                    onValueChange={(value) => setStoreSettings({ ...storeSettings, timezone: value })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <Clock className="h-4 w-4 mr-2 text-slate-500" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="Africa/Casablanca" className="text-white focus:bg-slate-800">Casablanca (GMT+1)</SelectItem>
                      <SelectItem value="Europe/Paris" className="text-white focus:bg-slate-800">Paris (GMT+1)</SelectItem>
                      <SelectItem value="UTC" className="text-white focus:bg-slate-800">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                Mon profil
              </CardTitle>
              <CardDescription className="text-slate-400">
                Gérez vos informations personnelles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl">
                      {getInitials(user?.name || null)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">{user?.name}</h3>
                  <p className="text-sm text-slate-400">{user?.email}</p>
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                    {user?.role}
                  </Badge>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-300">Nom complet</Label>
                  <Input
                    defaultValue={user?.name || ""}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    type="email"
                    defaultValue={user?.email || ""}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Téléphone</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    defaultValue="+212 6 00 00 00 00"
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" />
                Sécurité
              </CardTitle>
              <CardDescription className="text-slate-400">
                Gérez votre mot de passe et la sécurité de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-700 flex items-center justify-center">
                    <Key className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Mot de passe</p>
                    <p className="text-sm text-slate-500">Dernière modification il y a 30 jours</p>
                  </div>
                </div>
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent">
                      Modifier
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                      <DialogTitle>Changer le mot de passe</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Entrez votre mot de passe actuel et un nouveau mot de passe
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Mot de passe actuel</Label>
                        <Input
                          type="password"
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Nouveau mot de passe</Label>
                        <Input
                          type="password"
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Confirmer le mot de passe</Label>
                        <Input
                          type="password"
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                        Annuler
                      </Button>
                      <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                        Enregistrer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Authentification à deux facteurs</p>
                    <p className="text-sm text-slate-500">Ajoutez une couche de sécurité supplémentaire</p>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                Préférences de notification
              </CardTitle>
              <CardDescription className="text-slate-400">
                Configurez comment et quand vous souhaitez être notifié
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-300">Canaux de notification</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-white">Notifications par email</p>
                        <p className="text-sm text-slate-500">Recevez les notifications par email</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailNotifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-white">Notifications SMS</p>
                        <p className="text-sm text-slate-500">Recevez les notifications par SMS</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, smsNotifications: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-300">Types de notifications</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { key: "newOrders", label: "Nouvelles commandes", desc: "Lorsqu'une nouvelle commande est passée" },
                    { key: "lowStock", label: "Stock faible", desc: "Lorsqu'un produit est en stock faible" },
                    { key: "newCustomers", label: "Nouveaux clients", desc: "Lorsqu'un nouveau client s'inscrit" },
                    { key: "dailyReport", label: "Rapport quotidien", desc: "Résumé quotidien des ventes" },
                    { key: "weeklyReport", label: "Rapport hebdomadaire", desc: "Résumé hebdomadaire détaillé" },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700"
                    >
                      <div>
                        <p className="font-medium text-white">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key as keyof typeof notifications] as boolean}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, [item.key]: checked })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Taxes & Shipping Settings */}
        <TabsContent value="taxes" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Percent className="h-5 w-5 text-amber-500" />
                Paramètres de taxe
              </CardTitle>
              <CardDescription className="text-slate-400">
                Configurez la TVA et autres taxes applicables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Percent className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Activer les taxes</p>
                    <p className="text-sm text-slate-500">Appliquer la TVA sur les commandes</p>
                  </div>
                </div>
                <Switch
                  checked={taxSettings.taxEnabled}
                  onCheckedChange={(checked) =>
                    setTaxSettings({ ...taxSettings, taxEnabled: checked })
                  }
                />
              </div>

              {taxSettings.taxEnabled && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Taux de TVA (%)</Label>
                    <Input
                      type="number"
                      value={taxSettings.taxRate}
                      onChange={(e) =>
                        setTaxSettings({ ...taxSettings, taxRate: parseFloat(e.target.value) })
                      }
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Prix affichés</Label>
                    <Select
                      value={taxSettings.taxIncluded ? "included" : "excluded"}
                      onValueChange={(value) =>
                        setTaxSettings({ ...taxSettings, taxIncluded: value === "included" })
                      }
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        <SelectItem value="excluded" className="text-white focus:bg-slate-800">HT (Hors taxes)</SelectItem>
                        <SelectItem value="included" className="text-white focus:bg-slate-800">TTC (Toutes taxes comprises)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Truck className="h-5 w-5 text-amber-500" />
                Paramètres de livraison
              </CardTitle>
              <CardDescription className="text-slate-400">
                Configurez les frais et options de livraison
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Activer la livraison</p>
                    <p className="text-sm text-slate-500">Proposer la livraison aux clients</p>
                  </div>
                </div>
                <Switch
                  checked={taxSettings.shippingEnabled}
                  onCheckedChange={(checked) =>
                    setTaxSettings({ ...taxSettings, shippingEnabled: checked })
                  }
                />
              </div>

              {taxSettings.shippingEnabled && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Frais de livraison fixes (MAD)</Label>
                    <Input
                      type="number"
                      value={taxSettings.flatShippingRate}
                      onChange={(e) =>
                        setTaxSettings({ ...taxSettings, flatShippingRate: parseFloat(e.target.value) })
                      }
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Livraison gratuite à partir de (MAD)</Label>
                    <Input
                      type="number"
                      value={taxSettings.freeShippingThreshold}
                      onChange={(e) =>
                        setTaxSettings({ ...taxSettings, freeShippingThreshold: parseFloat(e.target.value) })
                      }
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-400">Livraison gratuite active</p>
                    <p className="text-sm text-emerald-300/70">
                      La livraison est gratuite pour les commandes supérieures à {taxSettings.freeShippingThreshold} MAD
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
