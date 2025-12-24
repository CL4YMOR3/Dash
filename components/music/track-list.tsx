"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Pause, Clock, MoreHorizontal, Music } from "lucide-react"
import { useMusic, type Track } from "@/lib/music-context"

interface TrackListProps {
  tracks: Track[]
  showAlbum?: boolean
  showHeader?: boolean
  compact?: boolean
}

export default function TrackList({ tracks, showAlbum = true, showHeader = true, compact = false }: TrackListProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useMusic()
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null)

  // Format time in MM:SS format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Handle track click
  const handleTrackClick = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay()
    } else {
      playTrack(track)
    }
  }

  return (
    <div className="w-full">
      {showHeader && (
        <div
          className={`grid ${showAlbum ? "grid-cols-12" : "grid-cols-10"} gap-4 px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800`}
        >
          <div className="col-span-1">#</div>
          <div className="col-span-5">TITLE</div>
          {showAlbum && <div className="col-span-3">ALBUM</div>}
          <div className="col-span-3 text-right">
            <Clock className="h-3 w-3 inline-block" />
          </div>
        </div>
      )}

      <div className={`${compact ? "max-h-96 overflow-y-auto" : ""}`}>
        {tracks.map((track, index) => {
          const isCurrentTrack = currentTrack?.id === track.id
          const isHovered = hoveredTrackId === track.id

          return (
            <motion.div
              key={track.id}
              className={`grid ${showAlbum ? "grid-cols-12" : "grid-cols-10"} gap-4 px-4 py-3 items-center ${
                isCurrentTrack
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-900 dark:text-white"
              } cursor-pointer transition-colors`}
              onMouseEnter={() => setHoveredTrackId(track.id)}
              onMouseLeave={() => setHoveredTrackId(null)}
              onClick={() => handleTrackClick(track)}
              whileTap={{ scale: 0.98 }}
            >
              <div className="col-span-1 flex items-center justify-center">
                {isCurrentTrack && isPlaying ? (
                  <Pause className="text-blue-600 dark:text-blue-400" />
                ) : isHovered || (isCurrentTrack && !isPlaying) ? (
                  <Play className="text-blue-600 dark:text-blue-400" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>

              <div className="col-span-5 flex items-center">
                <div className="w-10 h-10 rounded bg-slate-200 dark:bg-slate-800 mr-3 flex-shrink-0 overflow-hidden">
                  {track.coverArt ? (
                    <img
                      src={track.coverArt || "/placeholder.svg"}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium truncate">{track.title}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 truncate">{track.artist}</div>
                </div>
              </div>

              {showAlbum && <div className="col-span-3 text-sm truncate">{track.album || "—"}</div>}

              <div className="col-span-3 flex items-center justify-end">
                <span className="text-sm mr-2 text-slate-600 dark:text-slate-400">{formatTime(track.duration)}</span>
                <button className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
