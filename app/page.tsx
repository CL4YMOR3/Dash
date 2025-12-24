"use client"

import type React from "react"
import { useEffect, useState, Suspense, lazy } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { MapPin, AlertTriangle, Navigation, Car, Clock, Info, Activity, Music, Cloud } from "lucide-react"
import { ErrorBoundary } from "@/components/error-boundary"
import TeslaStyleWidgets from "@/components/tesla-style-widgets"
import { useTheme } from "@/lib/theme-context"
import StatusBar from "@/components/status-bar"

// Lazy load components for peak performance
const VoiceController = lazy(() => import("@/components/voice-controller"))
const BootLogo = lazy(() => import("@/components/boot-logo"))
const WeatherWidget = lazy(() => import("@/components/weather-widget"))
const HomeMusicWidget = lazy(() => import("@/components/music/home-music-widget"))
const MiniCampusMap = lazy(() => import("@/components/mini-campus-map"))

const WeatherWidgetFallback = () => {
  const { theme } = useTheme()
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-10 h-10 rounded-2xl ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
          <div className={`w-20 h-8 rounded-lg ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
        </div>
      </div>
      <div className={`w-full h-24 rounded-2xl ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`} />
    </div>
  )
}

const DEFAULT_LOCATION: any = {
  name: "NSHM Knowledge Campus",
  coordinates: [23.535, 87.3232],
  distance: "4.2 km",
  eta: "12 mins",
}

export default function Home() {
  const router = useRouter()
  const [showContent, setShowContent] = useState(false)
  const [nextDestination, setNextDestination] = useState<any | null>(null)
  const [isClient, setIsClient] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setIsClient(true)
    const bootAnimationShown = localStorage.getItem("bootAnimationShown")
    if (bootAnimationShown) {
      setShowContent(true)
    } else {
      const timer = setTimeout(() => {
        setShowContent(true)
        localStorage.setItem("bootAnimationShown", "true")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!isClient) return
    try {
      const savedDestination = localStorage.getItem("nextDestination")
      setNextDestination(savedDestination ? JSON.parse(savedDestination) : DEFAULT_LOCATION)
    } catch {
      setNextDestination(DEFAULT_LOCATION)
    }
  }, [isClient])

  const navigateTo = (path: string) => router.push(path)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  }

  return (
    <main className={`flex min-h-screen flex-col relative overflow-hidden theme-transition ${theme === "light" ? "bg-gray-50 text-slate-900" : "bg-[#020617] text-white"}`}>
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 bg-[url('/digital-grid.svg')] ${theme === "light" ? "opacity-3" : "opacity-10"}`} />
        <div className={`absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b ${theme === "light" ? "from-blue-50/50" : "from-blue-900/10"} to-transparent`} />

        {/* Dynamic Glows */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full blur-[150px] ${theme === "light" ? "bg-blue-100/20" : "bg-blue-600/5"}`}
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-[150px] ${theme === "light" ? "bg-indigo-100/20" : "bg-indigo-600/5"}`}
        />
      </div>

      <AnimatePresence mode="wait">
        {!showContent ? (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="z-50"
          >
            <Suspense fallback={<div className="h-screen w-screen bg-[#020617]" />}>
              <BootLogo />
            </Suspense>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className="w-full h-full flex flex-col z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <StatusBar />

            <motion.div
              className="flex-1 p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {/* Header Section */}
              <motion.div className="flex flex-col md:flex-row justify-between items-baseline mb-8 lg:mb-16" variants={itemVariants}>
                <div className="w-full md:w-auto text-center md:text-left">
                  <div className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-blue-500 mb-2">SYSTEM v3.2</div>
                  <motion.h1
                    className={`text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none ${theme === "light" ? "text-black" : "text-white"}`}
                    layoutId="main-title"
                  >
                    DASH
                  </motion.h1>
                </div>
                <div className="mt-8 md:mt-0 flex items-center justify-center md:justify-end gap-6 md:gap-8 w-full md:w-auto border-t border-white/5 pt-8 md:border-0 md:pt-0">
                  <div className="text-right">
                    <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-30">Car Health</div>
                    <div className="text-3xl md:text-4xl font-black leading-none">98.4<span className="text-sm opacity-30">%</span></div>
                  </div>
                  <div className="h-10 md:h-12 w-[1px] md:w-[2px] bg-slate-500/10" />
                  <Activity className="h-8 w-8 md:h-10 md:w-10 text-blue-500 animate-pulse" />
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                {/* Vehicle Diagnostics Column */}
                <motion.div className="lg:col-span-4 flex flex-col gap-8 lg:gap-10 order-2 lg:order-1" variants={itemVariants}>
                  <div className={`group rounded-[2.5rem] lg:rounded-[3rem] border transition-all duration-500 overflow-hidden ${theme === "light" ? "bg-white border-slate-200 shadow-xl" : "bg-slate-900/40 backdrop-blur-2xl border-white/5 hover:border-blue-500/30"}`}>
                    <div className="px-6 py-4 md:px-8 md:py-6 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Car className={`h-4 w-4 md:h-5 md:w-5 ${theme === "light" ? "text-blue-600" : "text-blue-400"}`} />
                        <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-40">Health Check</h2>
                      </div>
                      <button onClick={() => navigateTo("/car-conditions")} className="text-[8px] md:text-[9px] font-black text-blue-500 underline underline-offset-4 hover:text-blue-400 transition-colors uppercase tracking-widest leading-none">Details</button>
                    </div>
                    <div className="p-4 md:p-8">
                      <TeslaStyleWidgets />
                    </div>
                  </div>

                  <motion.div
                    className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border flex items-center space-x-6 md:space-x-8 cursor-pointer group ${theme === "light" ? "bg-amber-50 border-amber-200" : "bg-amber-900/5 border-amber-900/20"}`}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigateTo("/car-conditions")}
                  >
                    <div className="p-3 md:p-4 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/40 flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div>
                      <div className="text-amber-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1">Attention Required</div>
                      <div className={`text-base md:text-lg font-bold leading-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>Service in 800km</div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Central Intelligence Column */}
                <motion.div className="lg:col-span-5 flex flex-col gap-8 lg:gap-10 order-1 lg:order-2" variants={itemVariants}>
                  <div className={`rounded-[2.5rem] md:rounded-[3.5rem] border overflow-hidden relative group ${theme === "light" ? "bg-white border-slate-200 shadow-2xl" : "bg-white/5 backdrop-blur-3xl border-white/10"}`}>
                    <div className="px-6 py-4 md:px-8 md:py-6 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Navigation className={`h-4 w-4 md:h-5 md:w-5 ${theme === "light" ? "text-purple-600" : "text-purple-400"}`} />
                        <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-40">Your Map</h2>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[8px] md:text-[9px] font-bold opacity-40 uppercase tracking-widest leading-none">Ready</span>
                      </div>
                    </div>
                    <div className="p-6 md:p-10">
                      {nextDestination ? (
                        <div className="space-y-6 md:space-y-8">
                          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div className="space-y-1">
                              <div className="text-[9px] md:text-[10px] font-black text-purple-500 uppercase tracking-widest">Next Stop</div>
                              <div className="text-4xl md:text-5xl font-black tracking-tighter leading-none">{nextDestination.name}</div>
                              <div className="text-[10px] md:text-xs font-bold opacity-40 uppercase tracking-widest flex items-center pt-2">
                                <Clock className="h-3 w-3 mr-2" /> ETA {nextDestination.eta}
                              </div>
                            </div>
                            <div className="text-3xl md:text-4xl font-black text-blue-500 leading-none">{nextDestination.distance}</div>
                          </div>
                          <div className="h-[200px] md:h-[300px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative">
                            <Suspense fallback={<div className="h-full w-full bg-slate-900 animate-pulse" />}>
                              <MiniCampusMap location={nextDestination} zoom={17} />
                            </Suspense>
                            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.3)]" />
                          </div>
                          <button
                            onClick={() => navigateTo("/navigation")}
                            className="w-full py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-blue-600 text-white font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
                          >
                            Start Trip
                          </button>
                        </div>
                      ) : (
                        <div className="py-12 md:py-20 text-center">
                          <button onClick={() => navigateTo("/destination")} className="bg-white text-black px-10 md:12 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 hover:text-white transition-all">Choose Trip</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 md:gap-6">
                    <DashboardItem title="Pick Trip" icon={<MapPin className="h-5 w-5 md:h-6 md:w-6" />} onClick={() => navigateTo("/destination")} color="purple" />
                    <DashboardItem title="Vehicle" icon={<Car className="h-5 w-5 md:h-6 md:w-6" />} onClick={() => navigateTo("/car-conditions")} color="blue" />
                    <DashboardItem title="Drive" icon={<Navigation className="h-5 w-5 md:h-6 md:w-6" />} onClick={() => navigateTo("/navigation")} color="indigo" />
                  </div>
                </motion.div>

                {/* Satellite Widgets Column */}
                <motion.div className="lg:col-span-3 flex flex-col gap-8 lg:gap-10 order-3" variants={itemVariants}>
                  <div className={`rounded-[2.5rem] md:rounded-[3rem] border border-white/5 group transition-all duration-500 ${theme === "light" ? "bg-white shadow-xl" : "bg-slate-900/40 backdrop-blur-2xl"}`}>
                    <div className="px-6 py-4 md:px-8 md:py-6 border-b border-white/5 flex items-center space-x-3">
                      <Music className="h-4 w-4 text-pink-500" />
                      <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-40">Media</h2>
                    </div>
                    <div className="p-2">
                      <Suspense fallback={<div className="h-40 md:h-48 animate-pulse bg-white/5 rounded-3xl" />}>
                        <HomeMusicWidget />
                      </Suspense>
                    </div>
                  </div>

                  <div className={`rounded-[2.5rem] md:rounded-[3rem] border border-white/5 ${theme === "light" ? "bg-white shadow-xl" : "bg-slate-900/40 backdrop-blur-2xl"}`}>
                    <div className="px-6 py-4 md:px-8 md:py-6 border-b border-white/5 flex items-center space-x-3">
                      <Cloud className="h-4 w-4 text-cyan-500" />
                      <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-40">Weather Info</h2>
                    </div>
                    <div className="p-6 md:p-8">
                      <Suspense fallback={<WeatherWidgetFallback />}>
                        <WeatherWidget />
                      </Suspense>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <Suspense fallback={<div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-800 animate-pulse" />}>
                      <VoiceController isHomepage={true} />
                    </Suspense>
                    <div className="text-[8px] md:text-[10px] font-black tracking-[0.3em] md:tracking-[0.4em] uppercase opacity-20 mt-4 md:mt-6 relative px-4 text-center">
                      Voice Assist Active
                      <motion.div
                        animate={{ width: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-[1px] bg-blue-500"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

function DashboardItem({ title, icon, onClick, color }: { title: string, icon: React.ReactNode, onClick: () => void, color: string }) {
  const { theme } = useTheme()
  const colorClasses = {
    blue: "text-blue-500 bg-blue-500/5 hover:bg-blue-500",
    purple: "text-purple-500 bg-purple-500/5 hover:bg-purple-500",
    indigo: "text-indigo-500 bg-indigo-500/5 hover:bg-indigo-500",
  }

  return (
    <motion.button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 transition-all duration-500 ${theme === "light" ? "bg-white shadow-lg" : "bg-slate-900/40"} group overflow-hidden`}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-600/20 to-indigo-600/20`} />
      <div className={`mb-2 md:mb-4 transition-all duration-500 group-hover:scale-110 group-hover:text-white ${colorClasses[color as keyof typeof colorClasses].split(' hover:')[0]}`}>
        {icon}
      </div>
      <div className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] opacity-30 group-hover:opacity-100 group-hover:text-white transition-all text-center leading-none">
        {title}
      </div>
    </motion.button>
  )
}
