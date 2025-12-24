"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"
import LiveClock from "@/components/live-clock"
import { useTheme } from "@/lib/theme-context"

export default function StatusBar() {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const formattedDate = mounted
        ? new Date().toLocaleDateString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
        })
        : ""

    return (
        <motion.div
            className={
                theme === "light"
                    ? "w-full py-2 px-4 md:px-6 flex justify-between items-center sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 theme-transition"
                    : "w-full bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 py-2 px-4 md:px-6 flex justify-between items-center sticky top-0 z-50 theme-transition"
            }
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "circOut" }}
        >
            <div className="flex items-center space-x-3 md:space-x-4">
                <div className={`${theme === "light" ? "text-black" : "text-white"} font-black tracking-tighter hidden sm:block`}>
                    DASH
                </div>
                <div className={`${theme === "light" ? "h-4 w-[1px] bg-slate-200" : "h-4 w-[1px] bg-slate-700"} hidden sm:block`}></div>
                <div className="flex items-center space-x-2">
                    <Calendar className={`${theme === "light" ? "h-3 w-3 text-slate-500" : "h-3 w-3 text-slate-400"}`} />
                    <span className={`${theme === "light" ? "text-slate-600 text-[10px] md:text-sm font-bold" : "text-slate-400 text-[10px] md:text-sm font-bold"} uppercase tracking-widest`}>
                        {formattedDate}
                    </span>
                </div>
            </div>

            <div className="flex items-center space-x-3 md:space-x-4">
                <ThemeToggle />
                <div className="hidden md:flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <span className={theme === "light" ? "text-slate-700 text-xs font-bold uppercase tracking-widest" : "text-slate-300 text-xs font-bold uppercase tracking-widest"}>
                        Online
                    </span>
                </div>
                <div className={`${theme === "light" ? "h-4 w-[1px] bg-slate-200" : "h-4 w-[1px] bg-slate-700"} hidden md:block`}></div>
                <div className="flex items-center space-x-2">
                    <Clock className={`${theme === "light" ? "h-3 w-3 text-slate-500" : "h-3 w-3 text-slate-400"}`} />
                    <LiveClock
                        className={
                            theme === "light" ? "text-slate-900 text-xs md:text-sm font-black" : "text-white text-xs md:text-sm font-black"
                        }
                    />
                </div>
            </div>
        </motion.div>
    )
}
