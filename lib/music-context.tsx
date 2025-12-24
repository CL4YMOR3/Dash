"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"

// Define types for our music context
export interface Track {
  id: string
  title: string
  artist: string
  album?: string
  duration: number
  url: string // This will be an object URL for local files
  coverArt?: string
}

export interface Playlist {
  id: string
  name: string
  tracks: Track[]
}

interface MusicContextType {
  currentTrack: Track | null
  playlists: Playlist[]
  currentPlaylist: Playlist | null
  isPlaying: boolean
  volume: number
  currentTime: number
  duration: number
  audioRef: React.RefObject<HTMLAudioElement | null>
  shuffle: boolean
  repeat: "off" | "all" | "one"

  // Methods
  play: () => void
  pause: () => void
  togglePlay: () => void
  setVolume: (volume: number) => void
  seekTo: (time: number) => void
  playTrack: (track: Track) => void
  nextTrack: () => void
  previousTrack: () => void
  addTrack: (file: File) => Promise<void>
  createPlaylist: (name: string) => void
  addTrackToPlaylist: (trackId: string, playlistId: string) => void
  removeTrackFromPlaylist: (trackId: string, playlistId: string) => void
  setCurrentPlaylist: (playlist: Playlist) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
}

// Create the context with default values
const MusicContext = createContext<MusicContextType | undefined>(undefined)

// Sample tracks for initial state
const sampleTracks: Track[] = [
  {
    id: "1",
    title: "On My Way",
    artist: "Alan Walker, Sabrina Carpenter & Farruko",
    album: "On My Way",
    duration: 216,
    url: "/music-files/1.mp3",
    coverArt: "/music-files/on my way.jpg",
  },
  {
    id: "2",
    title: "Counting Stars",
    artist: "One Republic",
    album: "Native",
    duration: 282,
    url: "/music-files/OneRepublic - Counting Stars.mp3",
    coverArt: "/music-files/counting stars.jpeg",
  },
  {
    id: "3",
    title: "Do i wanna know",
    artist: "Arctic Monkeys",
    album: "AM",
    duration: 265,
    url: "/music-files/Arctic Monkeys - Do I Wanna Know_ (Official Video).mp3",
    coverArt: "/music-files/do i wanna know.png",
  },
]

// Sample playlists
const samplePlaylists: Playlist[] = [
  {
    id: "default",
    name: "Default Playlist",
    tracks: sampleTracks,
  },
]

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [playlists, setPlaylists] = useState<Playlist[]>(samplePlaylists)
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(samplePlaylists[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.7)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<"off" | "all" | "one">("off")

  const audioRef = useRef<HTMLAudioElement>(null)

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load saved state from localStorage
      try {
        const savedVolume = localStorage.getItem("advi_music_volume")
        if (savedVolume) {
          setVolumeState(Number.parseFloat(savedVolume))
        }

        const savedPlaylists = localStorage.getItem("advi_music_playlists")
        if (savedPlaylists) {
          setPlaylists(JSON.parse(savedPlaylists))
        }

        const savedCurrentPlaylistId = localStorage.getItem("advi_music_current_playlist")
        if (savedCurrentPlaylistId) {
          const playlist = playlists.find((p) => p.id === savedCurrentPlaylistId) || null
          setCurrentPlaylist(playlist)
        }

        const savedShuffle = localStorage.getItem("advi_music_shuffle")
        if (savedShuffle) {
          setShuffle(savedShuffle === "true")
        }

        const savedRepeat = localStorage.getItem("advi_music_repeat") as "off" | "all" | "one"
        if (savedRepeat) {
          setRepeat(savedRepeat)
        }
      } catch (error) {
        console.error("Error loading music state from localStorage:", error)
      }
    }
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("advi_music_volume", volume.toString())
      localStorage.setItem("advi_music_playlists", JSON.stringify(playlists))
      localStorage.setItem("advi_music_shuffle", shuffle.toString())
      localStorage.setItem("advi_music_repeat", repeat)
      if (currentPlaylist) {
        localStorage.setItem("advi_music_current_playlist", currentPlaylist.id)
      }
    }
  }, [volume, playlists, currentPlaylist, shuffle, repeat])

  // Update audio element when current track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url
      audioRef.current.load()
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error)
          setIsPlaying(false)
        })
      }
    }
  }, [currentTrack])

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Seek to specific time
  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  // Play a specific track
  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
  }, [])

  // Get a random track from the playlist
  const getRandomTrack = useCallback(
    (excludeCurrentTrack = true) => {
      if (!currentPlaylist || currentPlaylist.tracks.length === 0) return null

      let availableTracks = currentPlaylist.tracks
      if (excludeCurrentTrack && currentTrack) {
        availableTracks = currentPlaylist.tracks.filter((track) => track.id !== currentTrack.id)
      }

      if (availableTracks.length === 0) return currentPlaylist.tracks[0]

      const randomIndex = Math.floor(Math.random() * availableTracks.length)
      return availableTracks[randomIndex]
    },
    [currentPlaylist, currentTrack],
  )

  // Play next track
  const nextTrack = useCallback(() => {
    if (!currentTrack || !currentPlaylist || currentPlaylist.tracks.length === 0) return

    if (shuffle) {
      const randomTrack = getRandomTrack()
      if (randomTrack) {
        playTrack(randomTrack)
      }
      return
    }

    const currentIndex = currentPlaylist.tracks.findIndex((track) => track.id === currentTrack.id)
    if (currentIndex === -1) return

    const nextIndex = (currentIndex + 1) % currentPlaylist.tracks.length
    playTrack(currentPlaylist.tracks[nextIndex])
  }, [currentTrack, currentPlaylist, shuffle, getRandomTrack, playTrack])

  // Play previous track
  const previousTrack = useCallback(() => {
    if (!currentTrack || !currentPlaylist || currentPlaylist.tracks.length === 0) return

    if (shuffle) {
      const randomTrack = getRandomTrack()
      if (randomTrack) {
        playTrack(randomTrack)
      }
      return
    }

    const currentIndex = currentPlaylist.tracks.findIndex((track) => track.id === currentTrack.id)
    if (currentIndex === -1) return

    const prevIndex = (currentIndex - 1 + currentPlaylist.tracks.length) % currentPlaylist.tracks.length
    playTrack(currentPlaylist.tracks[prevIndex])
  }, [currentTrack, currentPlaylist, shuffle, getRandomTrack, playTrack])

  // Update time display
  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime)
        setDuration(audioRef.current.duration || 0)
      }
    }

    const handleEnded = () => {
      if (repeat === "one") {
        // Repeat the current track
        if (audioRef.current) {
          audioRef.current.currentTime = 0
          audioRef.current.play().catch((error) => {
            console.error("Error replaying audio:", error)
          })
        }
      } else {
        nextTrack()
      }
    }

    const audio = audioRef.current
    if (audio) {
      audio.addEventListener("timeupdate", updateTime)
      audio.addEventListener("ended", handleEnded)
      audio.addEventListener("loadedmetadata", updateTime)
    }

    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", updateTime)
        audio.removeEventListener("ended", handleEnded)
        audio.removeEventListener("loadedmetadata", updateTime)
      }
    }
  }, [repeat, nextTrack])

  // Play function
  const play = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch((error) => {
          console.error("Error playing audio:", error)
        })
    }
  }

  // Pause function
  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      pause()
    } else {
      if (!currentTrack && currentPlaylist && currentPlaylist.tracks.length > 0) {
        playTrack(currentPlaylist.tracks[0])
      } else {
        play()
      }
    }
  }

  // Set volume
  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume)
  }

  // Seek to specific time

  // Play a specific track
  // const playTrack = (track: Track) => {
  //   setCurrentTrack(track)
  //   setIsPlaying(true)
  // }

  // Add a track from a file
  const addTrack = async (file: File): Promise<void> => {
    try {
      // Create object URL for the file
      const url = URL.createObjectURL(file)

      // Get audio metadata if possible
      const title = file.name.replace(/\.[^/.]+$/, "") // Remove extension
      const artist = "Unknown Artist"
      let duration = 0

      // Create audio element to get duration
      const audio = new Audio(url)
      await new Promise<void>((resolve) => {
        audio.addEventListener("loadedmetadata", () => {
          duration = audio.duration
          resolve()
        })
        audio.addEventListener("error", () => {
          console.error("Error loading audio metadata")
          resolve()
        })
      })

      // Create new track
      const newTrack: Track = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        artist,
        duration,
        url,
      }

      // Add to default playlist
      if (currentPlaylist) {
        const updatedPlaylist = {
          ...currentPlaylist,
          tracks: [...currentPlaylist.tracks, newTrack],
        }

        setPlaylists(playlists.map((p) => (p.id === currentPlaylist.id ? updatedPlaylist : p)))

        setCurrentPlaylist(updatedPlaylist)
      } else if (playlists.length > 0) {
        // Add to first playlist if no current playlist
        const updatedPlaylist = {
          ...playlists[0],
          tracks: [...playlists[0].tracks, newTrack],
        }

        setPlaylists([updatedPlaylist, ...playlists.slice(1)])
        setCurrentPlaylist(updatedPlaylist)
      } else {
        // Create new playlist if none exist
        const newPlaylist: Playlist = {
          id: `playlist-${Date.now()}`,
          name: "My Playlist",
          tracks: [newTrack],
        }

        setPlaylists([newPlaylist])
        setCurrentPlaylist(newPlaylist)
      }
    } catch (error) {
      console.error("Error adding track:", error)
    }
  }

  // Create a new playlist
  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      tracks: [],
    }

    setPlaylists([...playlists, newPlaylist])
  }

  // Add a track to a playlist
  const addTrackToPlaylist = (trackId: string, playlistId: string) => {
    const track = playlists.flatMap((p) => p.tracks).find((t) => t.id === trackId)
    if (!track) return

    setPlaylists(
      playlists.map((playlist) => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            tracks: [...playlist.tracks, track],
          }
        }
        return playlist
      }),
    )
  }

  // Remove a track from a playlist
  const removeTrackFromPlaylist = (trackId: string, playlistId: string) => {
    setPlaylists(
      playlists.map((playlist) => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            tracks: playlist.tracks.filter((t) => t.id !== trackId),
          }
        }
        return playlist
      }),
    )
  }

  const toggleShuffle = () => {
    setShuffle(!shuffle)
  }

  const toggleRepeat = () => {
    setRepeat((prevRepeat) => {
      switch (prevRepeat) {
        case "off":
          return "all"
        case "all":
          return "one"
        case "one":
          return "off"
        default:
          return "off"
      }
    })
  }

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        playlists,
        currentPlaylist,
        isPlaying,
        volume,
        currentTime,
        duration,
        audioRef,
        shuffle,
        repeat,
        play,
        pause,
        togglePlay,
        setVolume,
        seekTo,
        playTrack,
        nextTrack,
        previousTrack,
        addTrack,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        setCurrentPlaylist,
        toggleShuffle,
        toggleRepeat,
      }}
    >
      {children}
      <audio ref={audioRef} />
    </MusicContext.Provider>
  )
}

// Custom hook to use the music context
export const useMusic = () => {
  const context = useContext(MusicContext)
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider")
  }
  return context
}
