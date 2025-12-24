"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function BootLogo() {
  const [mounted, setMounted] = useState(false)
  const [phase, setPhase] = useState(0) // 0: Init, 1: Assembling, 2: Stabilized, 3: Complete

  useEffect(() => {
    setMounted(true)

    // Phases of animation
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 4000),
    ]

    return () => timers.forEach(t => clearTimeout(t))
  }, [])

  if (!mounted) return null

  const primaryBlue = "#3b82f6"
  const secondaryBlue = "#60a5fa"

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          className="absolute inset-0 bg-[url('/digital-grid.svg')] bg-center opacity-10"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/10 blur-[150px] rounded-full"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* The Core Logo Animation */}
        <div className="relative w-64 h-64 flex items-center justify-center">

          {/* Outer Speed Rings */}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-20">
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke={primaryBlue}
                    strokeWidth="0.5"
                    strokeDasharray="1 4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke={secondaryBlue}
                    strokeWidth="0.2"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Assembly Pieces (Speed/Modern) */}
          <div className="absolute flex items-center justify-center">
            <motion.div
              layoutId="logo-main"
              className="text-white font-black text-8xl tracking-tighter flex items-baseline"
              initial={{ letterSpacing: "1em", opacity: 0, filter: "blur(10px)" }}
              animate={{
                letterSpacing: phase >= 2 ? "-0.05em" : "0.5em",
                opacity: phase >= 1 ? 1 : 0,
                filter: phase >= 1 ? "blur(0px)" : "blur(10px)"
              }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            >
              D
              <motion.span
                animate={{ width: phase >= 2 ? "auto" : 0, opacity: phase >= 2 ? 1 : 0 }}
                className="overflow-hidden inline-block"
              >
                ASH
              </motion.span>
            </motion.div>

            {/* Speed Slash */}
            <motion.div
              initial={{ rotate: 45, x: -100, opacity: 0 }}
              animate={phase >= 1 ? { x: 0, opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.8, ease: "circOut" }}
              className="absolute h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full blur-sm"
            />
          </div>

          {/* Reliability Rings (Pulsing steady) */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-4 rounded-full border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)]"
              >
                <motion.div
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border border-blue-400/10"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Indicators */}
        <div className="mt-12 w-64">
          <div className="flex justify-between items-end mb-2">
            <motion.span
              className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/60"
              animate={{ opacity: phase >= 1 ? 1 : 0 }}
            >
              System v3.2
            </motion.span>
            <motion.span
              className="text-[10px] font-mono text-white/40"
              animate={{ opacity: phase >= 1 ? 1 : 0 }}
            >
              {phase === 1 ? "INITIALIZING" : phase === 2 ? "STABILIZING" : "READY"}
            </motion.span>
          </div>

          <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden relative">
            <motion.div
              className="absolute inset-y-0 left-0 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]"
              initial={{ width: "0%" }}
              animate={{
                width: phase === 1 ? "40%" : phase === 2 ? "90%" : "100%"
              }}
              transition={{ duration: phase === 1 ? 1.5 : 2, ease: "easeInOut" }}
            />
          </div>

          <div className="flex justify-center gap-1 mt-4">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{
                  scale: phase >= 1 ? [1, 1.5, 1] : 1,
                  opacity: phase >= 1 ? [0.3, 1, 0.3] : 0.1
                }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1 h-1 rounded-full bg-blue-400"
              />
            ))}
          </div>
        </div>

        {/* Reliability Tags */}
        <motion.div
          className="mt-12 flex gap-8"
          initial={{ opacity: 0, y: 10 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
        >
          {["SPEED", "MODERN", "RELIABLE"].map((tag, i) => (
            <div key={tag} className="flex flex-col items-center gap-2">
              <div className="text-[8px] font-black tracking-[0.4em] text-white/20 uppercase">{tag}</div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 4 }}
                transition={{ delay: 1 + i * 0.2, duration: 0.5 }}
                className="w-[1px] bg-blue-500/40"
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Modern High-Speed Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
  )
}
