"use client"

import { useState } from "react"
import { Plus, Music, ListMusic, ChevronDown, ChevronRight } from "lucide-react"
import { useMusic } from "@/lib/music-context"

export default function PlaylistSidebar() {
  const { playlists, currentPlaylist, setCurrentPlaylist, createPlaylist } = useMusic()
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    playlists: true,
  })

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    })
  }

  // Handle playlist creation
  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim())
      setNewPlaylistName("")
      setIsCreatingPlaylist(false)
    }
  }

  return (
    <div className="w-full h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-r border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white">Music Library</h2>
        <button
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none"
          onClick={() => setIsCreatingPlaylist(true)}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Library section */}
      <div className="mb-4">
        <button
          className="flex items-center w-full text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          onClick={() => toggleSection("library")}
        >
          {expandedSections.library ? (
            <ChevronDown className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
          )}
          <Music className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
          <span>Library</span>
        </button>

        {expandedSections.library && (
          <div className="ml-4 mt-1 space-y-1">
            <button className="flex items-center w-full text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none">
              <Music className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
              <span>All Songs</span>
            </button>
          </div>
        )}
      </div>

      {/* Playlists section */}
      <div className="mb-4">
        <button
          className="flex items-center w-full text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          onClick={() => toggleSection("playlists")}
        >
          {expandedSections.playlists ? (
            <ChevronDown className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
          )}
          <ListMusic className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
          <span>Playlists</span>
        </button>

        {expandedSections.playlists && (
          <div className="ml-4 mt-1 space-y-1">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                className={`flex items-center w-full text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none ${
                  currentPlaylist?.id === playlist.id
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-slate-700 dark:text-slate-300"
                }`}
                onClick={() => setCurrentPlaylist(playlist)}
              >
                <ListMusic className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                <span>{playlist.name}</span>
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{playlist.tracks.length}</span>
              </button>
            ))}

            {isCreatingPlaylist && (
              <div className="flex items-center mt-2">
                <input
                  type="text"
                  className="flex-grow py-1 px-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="New playlist name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreatePlaylist()
                    if (e.key === "Escape") setIsCreatingPlaylist(false)
                  }}
                  autoFocus
                />
                <button
                  className="py-1 px-2 bg-blue-600 dark:bg-blue-500 text-white rounded-r-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none"
                  onClick={handleCreatePlaylist}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
