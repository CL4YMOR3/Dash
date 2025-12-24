"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Music, Play, Pause, SkipForward, SkipBack } from "lucide-react"
import { motion } from "framer-motion"
import { useMusic } from "@/lib/music-context"
import { useTheme } from "@/lib/theme-context"

export default function HomeMusicWidget() {
  const router = useRouter()
  const { theme } = useTheme()
  const { currentTrack, isPlaying, togglePlay, nextTrack, previousTrack, currentTime, duration } = useMusic()

  const handleWidgetClick = () => {
    router.push("/music")
  }

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <motion.div
      className={`p-6 rounded-[2rem] transition-all duration-500 overflow-hidden relative group cursor-pointer ${theme === "light" ? "hover:bg-slate-50" : "hover:bg-white/[0.02]"
        }`}
      onClick={handleWidgetClick}
    >
      <div className="flex flex-col space-y-6">
        {currentTrack ? (
          <>
            <div className="flex items-center space-x-5">
              <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                <motion.div
                  className="absolute inset-0 bg-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <div className="w-full h-full bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative z-10">
                  {currentTrack.coverArt ? (
                    <img
                      src={currentTrack.coverArt || "/placeholder.svg"}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="h-8 w-8 text-slate-500" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-black text-pink-500 uppercase tracking-[0.2em] mb-1">NOW PLAYING</div>
                <div className={`text-lg md:text-xl font-black truncate leading-tight tracking-tighter ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                  {currentTrack.title}
                </div>
                <div className="text-xs font-bold text-slate-400 truncate opacity-60 mt-1">{currentTrack.artist}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-1 w-full bg-slate-500/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[8px] font-bold opacity-30 uppercase tracking-widest">
                <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
                <span>{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: isPlaying ? [4, 16, 8, 12, 4] : 4 }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1 bg-pink-500/40 rounded-full"
                  />
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleAction(e, previousTrack)}
                  className="p-2 opacity-40 hover:opacity-100 transition-opacity"
                >
                  <SkipBack className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleAction(e, togglePlay)}
                  className={`p-4 rounded-full shadow-lg ${theme === "light" ? "bg-white text-black" : "bg-white text-slate-950"}`}
                >
                  {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleAction(e, nextTrack)}
                  className="p-2 opacity-40 hover:opacity-100 transition-opacity"
                >
                  <SkipForward className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="p-5 rounded-3xl bg-slate-500/5 border border-white/5">
              <Music className="h-8 w-8 text-slate-500" />
            </div>
            <div className="text-center">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20">NO MEDIA ACTIVE</div>
              <button
                onClick={(e) => { e.stopPropagation(); router.push("/music"); }}
                className="mt-4 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline"
              >
                OPEN LIBRARY
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
