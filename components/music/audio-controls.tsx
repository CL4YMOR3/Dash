"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Repeat, Repeat1, Shuffle } from "lucide-react"
import { useMusic } from "@/lib/music-context"

interface AudioControlsProps {
  compact?: boolean
}

export default function AudioControls({ compact = false }: AudioControlsProps) {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    previousTrack,
    volume,
    setVolume,
    currentTime,
    duration,
    seekTo,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
  } = useMusic()

  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState<number | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Format time in MM:SS format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const progressPercentage = dragProgress !== null ? dragProgress : duration > 0 ? (currentTime / duration) * 100 : 0

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return

    const rect = progressRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    const newTime = pos * duration

    seekTo(newTime)
  }

  // Handle progress bar drag
  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !progressRef.current || !duration) return

    const rect = progressRef.current.getBoundingClientRect()
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))

    setDragProgress(pos * 100)
  }

  // Handle drag end
  const handleDragEnd = () => {
    if (dragProgress !== null && duration) {
      const newTime = (dragProgress / 100) * duration
      seekTo(newTime)
    }

    setIsDragging(false)
    setDragProgress(null)
  }

  // Add window event listeners for drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleProgressDrag(e as unknown as React.MouseEvent<HTMLDivElement>)
    const handleMouseUp = () => handleDragEnd()

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragProgress])

  // Get volume icon based on level
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-5 w-5 icon-secondary" />
    if (volume < 0.5) return <Volume1 className="h-5 w-5 icon-secondary" />
    return <Volume2 className="h-5 w-5 icon-secondary" />
  }

  // Toggle mute
  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0)
    } else {
      setVolume(0.7)
    }
  }

  // Get repeat icon based on mode
  const getRepeatIcon = () => {
    if (repeat === "one")
      return <Repeat1 className="h-5 w-5 icon-primary" />
    return <Repeat className={`h-5 w-5 ${repeat !== "off" ? "icon-primary" : "icon-secondary"}`} />
  }

  return (
    <div
      className={`w-full ${compact ? "px-4" : "px-8"} py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800`}
    >
      {/* Progress bar */}
      <div
        ref={progressRef}
        className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full mb-4 cursor-pointer relative"
        onClick={handleProgressClick}
        onMouseDown={(e) => {
          setIsDragging(true)
          handleProgressDrag(e)
        }}
      >
        <div
          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full relative"
          style={{ width: `${progressPercentage}%` }}
        >
          <div
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-blue-600 dark:border-blue-400 ${isDragging ? "scale-150" : "scale-0"} transition-transform`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* Time display */}
        <div className="text-xs text-slate-600 dark:text-slate-400 w-16">{formatTime(currentTime)}</div>

        {/* Main controls */}
        <div className="flex items-center space-x-4">
          <button
            className={`text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none ${shuffle ? "text-blue-600 dark:text-blue-400" : ""}`}
            onClick={toggleShuffle}
            title={shuffle ? "Shuffle On" : "Shuffle Off"}
          >
            <Shuffle className={`h-5 w-5 ${shuffle ? "icon-primary" : "icon-secondary"}`} />
          </button>

          <button
            className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
            onClick={previousTrack}
          >
            <SkipBack className="h-6 w-6 icon-secondary" />
          </button>

          <motion.button
            className="bg-blue-600 dark:bg-blue-500 text-white rounded-full p-3 focus:outline-none"
            onClick={togglePlay}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </motion.button>

          <button
            className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
            onClick={nextTrack}
          >
            <SkipForward className="h-6 w-6 icon-secondary" />
          </button>

          <button
            className={`text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none ${repeat !== "off" ? "text-blue-600 dark:text-blue-400" : ""}`}
            onClick={toggleRepeat}
            title={repeat === "off" ? "Repeat Off" : repeat === "all" ? "Repeat All" : "Repeat One"}
          >
            {getRepeatIcon()}
          </button>
        </div>

        {/* Volume control */}
        <div className="flex items-center space-x-3 w-40">
          <button
            className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
            onClick={toggleMute}
          >
            {getVolumeIcon()}
          </button>

          <div className="relative flex-grow h-1 bg-slate-200 dark:bg-slate-800 rounded-full cursor-pointer">
            <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full" style={{ width: `${volume * 100}%` }} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Duration */}
        <div className="text-xs text-slate-600 dark:text-slate-400 w-16 text-right">{formatTime(duration)}</div>
      </div>
    </div>
  )
}
