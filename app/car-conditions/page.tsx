"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Car, Battery, Thermometer, ShieldCheck, Zap, Droplets, Gauge, AlertTriangle, CheckCircle, Activity } from "lucide-react"
import { useTheme } from "@/lib/theme-context"
import StatusBar from "@/components/status-bar"
import VoiceController from "@/components/voice-controller"
import Breadcrumbs from "@/components/breadcrumbs"

const carConditions = [
  {
    category: "Power & Battery",
    items: [
      { name: "Battery Health", status: "Perfect", value: "92%", color: "text-green-500", icon: <Battery className="h-5 w-5" />, gauge: 92 },
      { name: "Engine Temp", status: "Normal", value: "32°C", color: "text-blue-500", icon: <Thermometer className="h-5 w-5" />, gauge: 75 },
    ]
  },
  {
    category: "Engine & Drive",
    items: [
      { name: "Computer Speed", status: "Fast", value: "0.4ms", color: "text-purple-500", icon: <Zap className="h-5 w-5" />, gauge: 98 },
      { name: "Drive Power", status: "Full", value: "100%", color: "text-cyan-500", icon: <Gauge className="h-5 w-5" />, gauge: 100 },
    ]
  },
  {
    category: "Safety & Security",
    items: [
      { name: "Security Mode", status: "On", value: "Armed", color: "text-green-500", icon: <ShieldCheck className="h-5 w-5" />, gauge: 100 },
      { name: "Cooling System", status: "Stable", value: "Normal", color: "text-blue-400", icon: <Droplets className="h-5 w-5" />, gauge: 82 },
    ]
  }
]

export default function CarConditionsPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <main className={`flex min-h-screen flex-col relative overflow-hidden theme-transition ${theme === "light" ? "bg-gray-50 text-slate-900" : "bg-[#020617] text-white"}`}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 bg-[url('/digital-grid.svg')] ${theme === "light" ? "opacity-3" : "opacity-10"}`} />
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] ${theme === "light" ? "bg-blue-100/40" : "bg-blue-900/10"}`} />
      </div>

      <StatusBar />

      <div className="flex-1 p-4 md:p-8 lg:p-12 z-10 max-w-7xl mx-auto w-full">
        {/* Header section with responsive layout */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 lg:mb-16 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center md:text-left flex flex-col items-center md:items-start gap-4">
            <Breadcrumbs />
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">VEHICLE <span className="text-blue-500 text-6xl md:text-8xl block md:inline">HEALTH</span></h1>
          </div>

          <div className="flex items-center justify-center md:justify-end space-x-6 border-t border-white/5 pt-6 md:border-0 md:pt-0">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Overall Health</div>
              <div className="text-2xl md:text-3xl font-black">{mounted ? "98.4" : "--"}<span className="text-xs opacity-40">%</span></div>
            </div>
            <div className="h-10 w-[1px] bg-slate-500/20" />
            <Activity className="h-8 w-8 text-blue-500 animate-pulse" />
          </div>
        </motion.div>

        {/* Hero Alert - Responsive layout */}
        <motion.div
          className={`p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] mb-8 lg:mb-16 border ${theme === "light" ? "bg-white border-slate-200 shadow-xl" : "bg-slate-900/60 backdrop-blur-xl border-slate-800"}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="relative w-full lg:w-1/3 max-w-[320px] mx-auto lg:mx-0">
              <img src="/car.png" alt="DASH Car" className="w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-float" />
              <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full -z-10" />
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h2 className="text-xl md:text-3xl font-black tracking-tight uppercase">ALL SYSTEMS GO</h2>
              </div>
              <p className="opacity-60 text-sm md:text-base max-w-xl mb-8 mx-auto lg:mx-0">Your DASH is running perfectly. All systems are checked and your car is in great shape for your next trip.</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: "Update", value: "2m AGO" },
                  { label: "Brain", value: "DASH X1" },
                  { label: "Link", value: "FAST", color: "text-green-500" },
                  { label: "Status", value: "STABLE", color: "text-blue-400" }
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 md:border-white/10">
                    <div className="text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none">{stat.label}</div>
                    <div className={`text-[10px] md:text-xs font-bold font-mono uppercase ${stat.color || ""}`}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Categories - Responsive grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 pb-20"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {carConditions.map((category, idx) => (
            <motion.div key={idx} variants={itemVariants} className="space-y-6">
              <div className="flex items-center space-x-4 pl-2">
                <div className="h-1 w-8 bg-blue-500 rounded-full" />
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] opacity-40">{category.category}</h3>
              </div>

              <div className="space-y-4 md:space-y-6">
                {category.items.map((item, i) => (
                  <div
                    key={i}
                    className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border transition-all duration-500 group ${theme === "light" ? "bg-white border-slate-200 shadow-lg hover:shadow-xl" : "bg-slate-900/40 backdrop-blur-xl border-white/5 hover:border-blue-500/30"}`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-4 rounded-2xl ${theme === "light" ? "bg-slate-50" : "bg-white/5"} group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <div className="text-right">
                        <div className={`text-xl md:text-2xl font-black ${item.color}`}>{item.value}</div>
                        <div className="text-[8px] md:text-[10px] font-bold opacity-30 uppercase tracking-widest">{item.status}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-xs md:text-sm font-black tracking-tight">{item.name}</span>
                        <span className="text-[9px] font-bold opacity-20 uppercase tracking-tighter">{item.gauge}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-500/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.gauge}%` }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + (i * 0.1) }}
                          className={`h-full bg-current ${item.color.replace('text-', 'bg-')}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <VoiceController isHomepage={false} />
    </main>
  )
}
