"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Music, ListMusic, Disc, Mic2, Library, SkipBack, Play, Pause, SkipForward, Volume2 } from "lucide-react"
import { useMusic } from "@/lib/music-context"
import { useTheme } from "@/lib/theme-context"
import StatusBar from "@/components/status-bar"
import Breadcrumbs from "@/components/breadcrumbs"
import VoiceController from "@/components/voice-controller"

export default function MusicPlayerPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const {
    currentTrack,
    currentPlaylist,
    isPlaying,
    togglePlay,
    nextTrack,
    previousTrack,
    currentTime,
    duration,
    seekTo,
    playTrack
  } = useMusic()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <main className={`flex min-h-screen flex-col relative overflow-hidden theme-transition ${theme === "light" ? "bg-gray-50 text-slate-900" : "bg-[#020617] text-white"}`}>
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 bg-[url('/digital-grid.svg')] ${theme === "light" ? "opacity-3" : "opacity-10"}`} />
        <div className={`absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b ${theme === "light" ? "from-pink-50/50" : "from-pink-900/10"} to-transparent`} />

        {/* Dynamic Glows */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className={`absolute top-1/4 right-1/4 w-[800px] h-[800px] rounded-full blur-[150px] ${theme === "light" ? "bg-pink-100/30" : "bg-pink-600/5"}`}
        />
      </div>

      <StatusBar />

      <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-8 lg:p-12 gap-8 lg:gap-16 max-w-[1800px] mx-auto w-full z-10 overflow-y-auto lg:overflow-hidden">

        {/* Left Side: Library & Track List */}
        <motion.div
          className="w-full lg:w-[500px] flex flex-col gap-8 flex-shrink-0"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start gap-4">
            <Breadcrumbs />
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-2 uppercase">MUSIC <span className="text-pink-500">PLAYER</span></h1>
            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] leading-none">High Fidelity Audio Library</p>
          </div>

          <div className={`flex-1 rounded-[2.5rem] border overflow-hidden flex flex-col ${theme === "light" ? "bg-white border-slate-200 shadow-xl" : "bg-white/5 border-white/5 backdrop-blur-3xl"}`}>
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ListMusic className="h-5 w-5 text-pink-500" />
                <h2 className="text-[10px] font-black uppercase tracking-widest opacity-40">Your Library</h2>
              </div>
              <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{currentPlaylist?.tracks.length || 0} Tracks</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
              {currentPlaylist?.tracks.map((track) => {
                const isActive = currentTrack?.id === track.id
                return (
                  <motion.button
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 group ${isActive ? "bg-pink-600 text-white shadow-lg" : "hover:bg-white/5 border border-transparent hover:border-white/5"}`}
                    whileHover={{ x: 4 }}
                  >
                    <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative ${isActive ? "shadow-md" : ""}`}>
                      {track.coverArt ? (
                        <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <Music className="h-4 w-4 text-slate-500" />
                        </div>
                      )}
                      {isActive && isPlaying && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                              <motion.div key={i} animate={{ height: [4, 12, 4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }} className="w-1 bg-white rounded-full" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black truncate tracking-tight">{track.title}</div>
                      <div className={`text-[10px] font-bold truncate opacity-40 uppercase tracking-widest ${isActive ? "text-pink-100" : ""}`}>{track.artist}</div>
                    </div>
                    <div className={`text-[10px] font-mono opacity-40 ${isActive ? "text-pink-100" : ""}`}>
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Right Side: Now Playing Hero */}
        <motion.div
          className="flex-1 flex flex-col"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`flex-1 rounded-[3.5rem] md:rounded-[4.5rem] border overflow-hidden relative flex flex-col items-center justify-center p-8 lg:p-16 ${theme === "light" ? "bg-white border-slate-200 shadow-2xl" : "bg-white/5 border-white/10 backdrop-blur-3xl"}`}>

            {/* Dynamic Background Disc */}
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-[600px] h-[600px] border border-pink-500/10 rounded-full flex items-center justify-center pointer-events-none"
            >
              <div className="w-[400px] h-[400px] border border-pink-500/20 rounded-full" />
              <div className="w-[200px] h-[200px] border border-pink-500/30 rounded-full" />
            </motion.div>

            <AnimatePresence mode="wait">
              {currentTrack ? (
                <motion.div
                  key={currentTrack.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative z-10 flex flex-col items-center text-center w-full max-w-lg"
                >
                  <div className="relative w-64 h-64 md:w-80 md:h-80 mb-12">
                    <motion.div
                      animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-pink-500/20 blur-[60px] rounded-full"
                    />
                    <div className="w-full h-full rounded-[3rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-white/10 relative z-10">
                      {currentTrack.coverArt ? (
                        <img src={currentTrack.coverArt} alt={currentTrack.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                          <Music className="h-24 w-24 text-slate-700" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 mb-12">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">{currentTrack.title}</h2>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
                        <Mic2 className="h-3 w-3 text-pink-500" />
                        <span className="text-xs font-black uppercase tracking-widest opacity-60">{currentTrack.artist}</span>
                      </div>
                      {currentTrack.album && (
                        <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
                          <Disc className="h-3 w-3 text-blue-500" />
                          <span className="text-xs font-black uppercase tracking-widest opacity-60">{currentTrack.album}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Slider */}
                  <div className="w-full space-y-4 mb-12">
                    <div
                      className="relative h-2 w-full bg-white/5 rounded-full cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x = e.clientX - rect.left
                        seekTo((x / rect.width) * duration)
                      }}
                    >
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-pink-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow-lg border-2 border-pink-500"
                        style={{ left: `${progress}%`, marginLeft: '-8px' }}
                        whileHover={{ scale: 1.2 }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-black font-mono opacity-40 uppercase tracking-widest">
                      <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
                      <span>{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>

                  {/* Main Controls */}
                  <div className="flex items-center space-x-12">
                    <motion.button
                      whileHover={{ scale: 1.2, x: -5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={previousTrack}
                      className="p-4 opacity-40 hover:opacity-100 transition-opacity"
                    >
                      <SkipBack className="h-8 w-8" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={togglePlay}
                      className="w-24 h-24 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-2xl shadow-white/20"
                    >
                      {isPlaying ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current ml-2" />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2, x: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={nextTrack}
                      className="p-4 opacity-40 hover:opacity-100 transition-opacity"
                    >
                      <SkipForward className="h-8 w-8" />
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center space-y-8 relative z-10">
                  <div className="w-40 h-40 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mx-auto">
                    <Library className="h-16 w-16 text-slate-700" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Library Empty</h2>
                    <p className="opacity-40 text-sm font-bold uppercase tracking-widest">Select a song from the list to begin</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <VoiceController isHomepage={false} />
    </main>
  )
}
