"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Check, ArrowLeft, MapPin, Clock, Navigation2, Search, Compass, Target } from "lucide-react"
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

const locations: { name: string; distance: string; eta: string; traffic: string; coordinates: [number, number] }[] = [
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

export default function DestinationPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [activeLocation, setActiveLocation] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [showRoute, setShowRoute] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      if (selectedLocations.length === 1 || selectedLocations[0] === location) {
        setSelectedLocations(selectedLocations.filter((loc) => loc !== location))
      } else {
        setSelectedLocations([selectedLocations[0], ...selectedLocations.slice(1).filter((loc) => loc !== location)])
      }
      setShowRoute(false)
    } else {
      if (selectedLocations.length === 0) {
        setSelectedLocations([location])
      } else {
        setSelectedLocations([...selectedLocations, location])
      }
    }
    setActiveLocation(location)
  }

  const handleStartNavigation = () => {
    if (selectedLocations.length === 0) return
    localStorage.setItem("navigationDestinations", JSON.stringify(selectedLocations.map(name => locations.find(l => l.name === name))))
    setShowRoute(true)
    setTimeout(() => router.push("/navigation"), 1200)
  }

  if (!isClient) return null

  return (
    <main className={`flex min-h-screen flex-col relative overflow-hidden theme-transition ${theme === "light" ? "bg-gray-50 text-slate-900" : "bg-[#020617] text-white"}`}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 bg-[url('/digital-grid.svg')] ${theme === "light" ? "opacity-3" : "opacity-10"}`} />
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] ${theme === "light" ? "bg-purple-100/50" : "bg-purple-900/10"}`} />
      </div>

      <StatusBar />

      <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-8 lg:p-12 gap-8 lg:gap-10 max-w-[1800px] mx-auto w-full z-10 overflow-y-auto lg:overflow-hidden">
        {/* Left Side: Destination Selection */}
        <motion.div
          className="w-full lg:w-[450px] flex flex-col gap-6 md:gap-8 flex-shrink-0"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start gap-4">
            <Breadcrumbs />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none mb-2 uppercase">PICK YOUR <br className="hidden lg:block" /><span className="text-blue-500">TRIP</span></h1>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest leading-none">Choose your stops to calculate the route</p>
          </div>

          <div className="flex-1 space-y-3 max-h-[400px] lg:max-h-[calc(100vh-450px)] overflow-y-auto pr-2 scrollbar-hide">
            {locations.map((location, index) => {
              const isSelected = selectedLocations.includes(location.name);
              const isStart = selectedLocations[0] === location.name;

              return (
                <motion.button
                  key={location.name}
                  className={`w-full p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-left transition-all relative overflow-hidden group border ${isSelected
                    ? "bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-600/20"
                    : `${theme === "light" ? "bg-white border-slate-200" : "bg-white/5 border-white/5"} hover:border-blue-500/40`
                    }`}
                  onClick={() => toggleLocation(location.name)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${isSelected ? "bg-white/20" : "bg-slate-500/10"}`}>
                        <MapPin className={`h-4 w-4 md:h-5 md:w-5 ${isSelected ? "text-white" : "text-blue-500"}`} />
                      </div>
                      <div>
                        <div className="text-sm md:text-lg font-black tracking-tight">{location.name}</div>
                        <div className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${isSelected ? "text-white/60" : "opacity-30"}`}>
                          {isSelected ? (isStart ? "WHERE YOU ARE" : "STOP") : "READY"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-black">{location.distance}</div>
                      <div className={`text-[10px] font-bold ${isSelected ? "text-white/60" : "opacity-30"}`}>{location.eta}</div>
                    </div>
                  </div>

                  {/* Traffic indicator - smaller for mobile */}
                  <div className={`absolute top-0 right-0 w-1 md:w-1.5 h-full ${location.traffic === "Light" ? "bg-green-500" : location.traffic === "Medium" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                </motion.button>
              )
            })}
          </div>

          <motion.button
            className={`w-full py-5 md:py-6 rounded-[2rem] md:rounded-[2.5rem] font-black text-[10px] md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all relative overflow-hidden shadow-2xl mb-8 lg:mb-0 ${selectedLocations.length === 0
              ? "bg-slate-500/10 text-slate-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.98] shadow-blue-600/20"
              }`}
            onClick={handleStartNavigation}
            disabled={selectedLocations.length === 0}
          >
            CONFIRM TRIP {selectedLocations.length > 0 && `(${selectedLocations.length})`}
          </motion.button>
        </motion.div>

        {/* Right Side: Map Preview - Responsive height */}
        <motion.div
          className={`flex-1 min-h-[400px] lg:min-h-0 rounded-[2.5rem] md:rounded-[3.5rem] border overflow-hidden relative theme-transition mb-12 lg:mb-0 ${theme === "light" ? "bg-white border-slate-200 shadow-2xl" : "bg-white/5 border-white/10"}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Mobile HUD Overlays */}
          <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-white flex items-center space-x-3">
              <Compass className="h-3 w-3 md:h-4 md:w-4 text-blue-400 animate-spin-slow" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-none">MAP ACTIVE</span>
            </div>
            {selectedLocations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl bg-blue-600 text-white shadow-xl flex items-center space-x-3"
              >
                <Target className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-none text-center">{selectedLocations.length} STOPS SELECTED</span>
              </motion.div>
            )}
          </div>

          <div className="w-full h-full relative">
            <CampusMap
              locations={locations}
              activeLocation={activeLocation}
              selectedLocations={selectedLocations}
              onMarkerClick={(locationName) => setActiveLocation(locationName)}
              forceLight={theme === "light"}
              showRoute={showRoute}
            />
            {/* Dark vignette */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.4)]" />
          </div>
        </motion.div>
      </div>

      <VoiceController isHomepage={false} />
    </main>
  )
}
