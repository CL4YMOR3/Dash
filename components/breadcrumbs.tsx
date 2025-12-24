"use client"

import { usePathname, useRouter } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "@/lib/theme-context"

export default function Breadcrumbs() {
    const pathname = usePathname()
    const router = useRouter()
    const { theme } = useTheme()

    if (pathname === "/") return null

    const pathSegments = pathname.split("/").filter((segment) => segment !== "")

    // Map technical path segments to consumer English
    const segmentMap: Record<string, string> = {
        "car-conditions": "Health",
        "destination": "Trip",
        "navigation": "Drive",
        "music": "Music"
    }

    return (
        <nav className="flex items-center space-x-2 py-2 px-4 md:px-0">
            <motion.button
                onClick={() => router.push("/")}
                className={`flex items-center text-[10px] font-black uppercase tracking-widest ${theme === "light" ? "text-slate-400 hover:text-black" : "text-slate-500 hover:text-white"} transition-colors`}
                whileHover={{ x: -2 }}
            >
                <Home className="h-3 w-3 mr-1.5" />
                DASH
            </motion.button>

            {pathSegments.map((segment, index) => {
                const path = `/${pathSegments.slice(0, index + 1).join("/")}`
                const isLast = index === pathSegments.length - 1
                const label = segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

                return (
                    <div key={path} className="flex items-center space-x-2">
                        <ChevronRight className={`h-3 w-3 ${theme === "light" ? "text-slate-300" : "text-slate-700"}`} />
                        <motion.button
                            onClick={() => !isLast && router.push(path)}
                            disabled={isLast}
                            className={`text-[10px] font-black uppercase tracking-widest ${isLast
                                    ? "text-blue-500"
                                    : theme === "light" ? "text-slate-400 hover:text-black" : "text-slate-500 hover:text-white"
                                } transition-colors`}
                            whileHover={!isLast ? { x: 2 } : {}}
                        >
                            {label}
                        </motion.button>
                    </div>
                )
            })}
        </nav>
    )
}
