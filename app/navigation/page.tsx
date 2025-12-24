"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Navigation, Clock, MapPin, ChevronRight, Car, Flag, Info, Play, CircleStop } from "lucide-react"
import VoiceController from "@/components/voice-controller"
import { useTheme } from "@/lib/theme-context"
import dynamic from "next/dynamic"
import StatusBar from "@/components/status-bar"
import Breadcrumbs from "@/components/breadcrumbs"

// Dynamically import the CampusMap component with no SSR
const CampusMap = dynamic(() => import("@/components/campus-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent backdrop-blur-3xl">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
    </div>
  ),
})

const defaultLocations: { name: string; distance: string; eta: string; traffic: string; coordinates: [number, number] }[] = [
  { name: "Gate 1", distance: "0.2 km", eta: "1 min", traffic: "Light", coordinates: [23.517138, 87.377658] },
  { name: "Admin", distance: "0.3 km", eta: "2 min", traffic: "Light", coordinates: [23.516652, 87.377127] },
  { name: "MBA Block", distance: "0.4 km", eta: "3 min", traffic: "Light", coordinates: [23.51704, 87.376982] },
  { name: "ITES Building", distance: "0.5 km", eta: "4 min", traffic: "Medium", coordinates: [23.517591, 87.377132] },
  { name: "Management Block", distance: "0.6 km", eta: "5 min", traffic: "Medium", coordinates: [23.516888, 87.376698] },
  { name: "D Block", distance: "0.7 km", eta: "6 min", traffic: "Medium", coordinates: [23.51677, 87.376456] },
  { name: "E Block", distance: "0.8 km", eta: "7 min", traffic: "Medium", coordinates: [23.516686, 87.376124] },
  { name: "Boys Hostel", distance: "1.2 km", eta: "10 min", traffic: "Heavy", coordinates: [23.515919, 87.375517] },
  { name: "Girls Hostel", distance: "1.5 km", eta: "12 min", traffic: "Heavy", coordinates: [23.516996, 87.374241] },
  { name: "Canteen", distance: "1.0 km", eta: "8 min", traffic: "Medium", coordinates: [23.517512, 87.374536] },
  { name: "Library", distance: "0.5 km", eta: "4 min", traffic: "Light", coordinates: [23.516691, 87.376387] },
  { name: "Cafe", distance: "0.3 km", eta: "2 min", traffic: "Light", coordinates: [23.516838, 87.377148] },
]

export default function NavigationPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [destinations, setDestinations] = useState<any[]>([])
  const [activeLocation, setActiveLocation] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [showRoute, setShowRoute] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem("navigationDestinations")
    if (saved) {
      const parsed = JSON.parse(saved).filter(Boolean)
      setDestinations(parsed)
      if (parsed.length > 0) setActiveLocation(parsed[0].name)
      setTimeout(() => setShowRoute(true), 800)
    }
  }, [])

  const totalDistance = destinations.reduce((acc, d) => acc + parseFloat(d.distance?.replace(" km", "") || "0"), 0).toFixed(1)

  if (!isClient) return null

  return (
    <main className={`flex min-h-screen flex-col relative overflow-hidden theme-transition ${theme === "light" ? "bg-gray-50 text-slate-900" : "bg-[#020617] text-white"}`}>
      {/* HUD Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 bg-[url('/digital-grid.svg')] ${theme === "light" ? "opacity-3" : "opacity-10"}`} />
        <div className={`absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-[150px] ${theme === "light" ? "bg-blue-100/50" : "bg-blue-900/10"}`} />
      </div>

      <StatusBar />

      <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-8 lg:p-12 gap-8 lg:gap-10 max-w-[1800px] mx-auto w-full z-10 overflow-y-auto lg:overflow-hidden">

        {/* Main Map Viewport - Responsive Height */}
        <motion.div
          className={`flex-1 min-h-[450px] lg:min-h-0 rounded-[2.5rem] md:rounded-[3.5rem] border overflow-hidden relative group ${theme === "light" ? "bg-white border-slate-200 shadow-2xl" : "bg-white/5 border-white/10"}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-full h-full relative">
            <CampusMap
              locations={defaultLocations}
              activeLocation={activeLocation}
              selectedLocations={destinations.map(d => d.name)}
              onMarkerClick={(name) => setActiveLocation(name)}
              showRoute={showRoute}
              forceLight={theme === "light"}
            />

            {/* HUD Overlay - Responsive Positioning */}
            <div className="absolute top-4 left-4 md:top-8 md:left-8 flex flex-col gap-3 md:gap-4 max-w-[calc(100%-2rem)]">
              <div className="px-5 py-3 md:px-8 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-black/60 backdrop-blur-2xl border border-white/10 text-white shadow-2xl">
                <div className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">GOING TO</div>
                <div className="text-lg md:text-2xl font-black tracking-tighter truncate">
                  {activeLocation ? `Heading to ${activeLocation}` : "Starting..."}
                </div>
              </div>
            </div>

            {/* Instruction Bubble - Responsive sizing */}
            {activeLocation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 px-6 py-4 md:px-10 md:py-6 rounded-[2rem] md:rounded-[2.5rem] bg-blue-600 text-white shadow-2xl shadow-blue-600/40 flex items-center gap-4 md:gap-6 w-[90%] md:w-auto max-w-[500px]"
              >
                <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white text-blue-600 flex-shrink-0">
                  <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-60">NEXT TURN</div>
                  <div className="text-base md:text-xl font-black tracking-tight truncate leading-tight">Turn into {activeLocation}</div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Right HUD: Trip Intel - Responsive Grid/Layout */}
        <motion.div
          className="w-full lg:w-[400px] flex flex-col gap-6 md:gap-8 flex-shrink-0"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col text-center lg:text-left items-center lg:items-start gap-4">
            <Breadcrumbs />
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">TRIP <br className="hidden lg:block" /><span className="text-blue-500">INFO</span></h2>
            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] leading-none">Driving Details</p>
          </div>

          <div className={`p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border ${theme === "light" ? "bg-white border-slate-200 shadow-xl" : "bg-white/5 border-white/5"}`}>
            <div className="flex justify-between items-center mb-8 md:mb-10">
              <div>
                <div className="text-[8px] md:text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">ARRIVE</div>
                <div className="text-3xl md:text-4xl font-black leading-none">{destinations.length > 0 ? destinations[0].eta : "--"}</div>
              </div>
              <div className="text-right">
                <div className="text-[8px] md:text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">AWAY</div>
                <div className="text-3xl md:text-4xl font-black leading-none">{totalDistance}<span className="text-xs opacity-30 ml-1">KM</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-500/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-[10px] font-bold tracking-tight opacity-60 uppercase">Traffic</span>
                </div>
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">MINIMAL</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-500/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <Navigation className="h-4 w-4 text-purple-500" />
                  <span className="text-[10px] font-bold tracking-tight opacity-60 uppercase">Signal</span>
                </div>
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">GREAT</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 max-h-[300px] lg:max-h-none overflow-y-auto pr-2 scrollbar-hide">
            {destinations.map((dest, i) => (
              <div
                key={dest.name}
                className={`flex items-center gap-4 md:gap-5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border transition-all ${activeLocation === dest.name ? "bg-blue-600 border-blue-500 text-white shadow-xl" : "bg-white/5 border-white/5 opacity-40"}`}
              >
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center font-black flex-shrink-0 ${activeLocation === dest.name ? "bg-white text-blue-600" : "bg-slate-500/20"}`}>
                  {i === 0 ? "S" : i}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm md:text-base font-black truncate tracking-tight">{dest.name}</div>
                  <div className="text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-60 leading-none mt-1">{dest.eta} • {dest.distance}</div>
                </div>
                {activeLocation === dest.name && <Play className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 pb-12 lg:pb-0">
            <button
              onClick={() => router.push("/destination")}
              className={`py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] border transition-all active:scale-[0.98] ${theme === "light" ? "bg-white border-slate-200 hover:bg-slate-50" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
            >
              ADD STOP
            </button>
            <button
              onClick={() => router.push("/")}
              className="py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all active:scale-[0.98]"
            >
              END TRIP
            </button>
          </div>
        </motion.div>
      </div>

      <VoiceController isHomepage={false} />
    </main>
  )
}
