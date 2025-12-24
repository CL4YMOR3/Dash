"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { sendVoiceCommand, testBackendConnection } from "@/lib/api"
import { useMusic } from "@/lib/music-context"  // Import the music context
import speechService from "@/lib/speech-synthesis"  // Import our speech service

interface VoiceControllerProps {
  className?: string
  isHomepage?: boolean
}

export default function VoiceController({ className = "", isHomepage = false }: VoiceControllerProps) {
  const [transcript, setTranscript] = useState("")
  const [status, setStatus] = useState<"idle" | "listening" | "processing" | "success" | "error">("idle")
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)
  // Talk back is always enabled now
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const selectedMimeTypeRef = useRef<string>("")
  const buttonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const latestRequestIdRef = useRef<string>("")

  // Import music context functions
  const {
    togglePlay,
    nextTrack,
    previousTrack,
    volume,
    setVolume,
    isPlaying,
  } = useMusic()

  // List of valid destinations from CAMPUS_LOCATIONS in the backend
  const VALID_DESTINATIONS = [
    "gate 1", "admin", "mba block", "ites building", "management block",
    "d block", "e block", "boys hostel", "girls hostel", "canteen", 
    "library", "cafe"
  ]

  useEffect(() => {
    async function checkConnection() {
      const result = await testBackendConnection()
      setBackendConnected(result.connected)
    }
    checkConnection()

    // Initialize speech service with default settings
    speechService.updateOptions({
      rate: 1.0,
      pitch: 1.0,
      volume: 0.8,
      lang: 'en-US'
    })

    return () => {
      // Cancel any speech when component unmounts
      speechService.cancel()
    }
  }, [])

  // Talk back feature is always enabled

  const getSupportedMimeType = (): string => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/wav",
    ]
    for (const t of types) if (MediaRecorder.isTypeSupported(t)) return t
    throw new Error("No supported audio format found")
  }

  const startRecording = async () => {
    audioChunksRef.current = []
    setStatus("listening")
    setTranscript("Listening...")
    
    // Speak feedback
    speechService.speak("Listening")

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = getSupportedMimeType()
      selectedMimeTypeRef.current = mimeType
      const recorder = new MediaRecorder(stream, { mimeType })

      recorder.ondataavailable = e => { if (e.data.size) audioChunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType })
        await processAudioData(blob)
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setTimeout(() => { if (recorder.state === 'recording') stopRecording() }, 5000)
    } catch (err) {
      console.error('Mic error', err)
      setStatus("error")
      setTranscript("Microphone access denied")
      
      // Speak error message
      speechService.speak("Microphone access denied")
      
      setTimeout(() => { setStatus("idle"); setTranscript("") }, 3000)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      setStatus("processing")
      setTranscript("Processing...")
      
      // Speak feedback
      speechService.speak("Processing your command")
      
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
    }
  }

  const isValidDestination = (location: string): boolean => {
    return VALID_DESTINATIONS.includes(location.toLowerCase());
  }

  // Handle music actions
  const handleMusicAction = (action: string) => {
    switch (action) {
      case "play_music":
        if (!isPlaying) togglePlay();
        return "Playing music";
      case "pause_music":
        if (isPlaying) togglePlay();
        return "Paused music";
      case "next_track":
        nextTrack();
        return "Playing next track";
      case "previous_track":
        previousTrack();
        return "Playing previous track";
      case "volume_up":
        setVolume(Math.min(1, volume + 0.1));
        return "Volume increased";
      case "volume_down":
        setVolume(Math.max(0, volume - 0.1));
        return "Volume decreased";
      case "mute":
        setVolume(0);
        return "Muted";
      case "unmute":
        setVolume(0.7);
        return "Unmuted";
      default:
        return null;
    }
  }
  
  const processAudioData = async (audioBlob: Blob) => {
    if (!backendConnected) {
      setStatus("error")
      setTranscript("Backend not connected")
      
      // Speak error message
      speechService.speak("Backend not connected")
      
      setTimeout(() => { setStatus("idle"); setTranscript("") }, 3000)
      return
    }
  
    // Generate a unique request ID for this command
    const requestId = Date.now().toString()
    latestRequestIdRef.current = requestId
  
    try {
      const result = await sendVoiceCommand(audioBlob)
      console.log('VoiceCommandResult:', result)
  
      // Ensure this is still the latest request
      if (requestId !== latestRequestIdRef.current) {
        console.log('Ignoring stale command result')
        return
      }
  
      if (!result.success) {
        setStatus("error")
        const errorMessage = typeof result.error === "string" ? result.error : "Command not recognized";
        setTranscript(errorMessage);
        
        // Speak error message
        speechService.speak(errorMessage)
      } else {
        setStatus("success")
        setTranscript(result.command || "")
        
        // Speak the recognized command or a confirmation
        const speechText = `Understood: ${result.command}`
        speechService.speak(speechText)
  
        setTimeout(() => {
          // Check again if this is still the latest request
          if (requestId !== latestRequestIdRef.current) return
  
          // Handle music actions
          if (result.route && result.route.startsWith('action:')) { 
            const action = result.route.replace('action:', '')
            const actionResult = handleMusicAction(action)
            
            if (actionResult) {
              setTranscript(actionResult)
              
              // Speak action confirmation
              speechService.speak(actionResult)
              
              // Don't redirect for music actions
              return
            }
          }
          
          // Handle navigation actions
          if (result.isNavigation && result.startLocation && result.location) {
            console.log(`Navigation command: ${result.startLocation} to ${result.location}`)
            
            // Check if destination is valid
            if (isValidDestination(result.location)) {
              // Speak navigation confirmation
              speechService.speak(`Navigating from ${result.startLocation} to ${result.location}`)
              
              // Valid destination, handle navigation through destination page
              handleNavigation(result.location, result.startLocation);
            } else {
              // Invalid destination
              setStatus("error")
              const invalidMessage = `"${result.location}" is not a valid destination. Please select from the list.`
              setTranscript(invalidMessage)
              
              // Speak invalid destination message
              speechService.speak(invalidMessage)
              
              setTimeout(() => {
                router.push('/destination');
                setStatus("idle")
                setTranscript("")
              }, 2000)
            }
          } else if (result.route && !result.route.startsWith('action:')) {
            // For other pages, give simple acknowledgement
            const page = result.route === '/' ? 'home' : result.route.replace('/', '')
            speechService.speak(`Opening ${page} page`)
            // Only redirect if not an action
            router.push(result.route)
          }
        }, 1000)
      }
    } catch (err) {
      console.error('ProcessAudioData error', err)
      setStatus("error")
      setTranscript("Error processing command")
      
      // Speak error message
      speechService.speak("Error processing command")
    } finally {
      setTimeout(() => { 
        // Only reset if this is still the latest request
        if (requestId === latestRequestIdRef.current && status !== "error") {
          setStatus("idle")
          setTranscript("") 
        }
      }, 3000)
    }
  }

  const handleNavigation = (location: string, startLocation: string) => {
    // Store the navigation data in sessionStorage 
    // This will be used by the destination page to auto-select and navigate
    if (location && startLocation) {
      const navigationData = {
        startLocation,
        destination: location,
        timestamp: Date.now(),
        autoNavigate: true  // This flag is crucial for the auto-navigation
      };
      sessionStorage.setItem('voiceNavigationData', JSON.stringify(navigationData));
      
      // Navigate to the destination page
      router.push('/destination');
    }
  };

  const toggleListening = () => {
    status === 'idle' ? startRecording() : status === 'listening' && stopRecording()
  }

  const getButtonClasses = () => {
    const base = "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300"
    const map = {
      idle: "bg-white dark:bg-slate-800 text-teal-600 hover:bg-teal-600 hover:text-white",
      listening: "bg-teal-600 text-white",
      processing: "bg-teal-700 text-white",
      success: "bg-green-600 text-white",
      error: "bg-red-600 text-white",
    }
    return `${base} ${map[status]}`
  }

  const containerClass = isHomepage ? className : `microphone-fixed ${className}`

  return (
    <div className={`relative ${containerClass}`}>
      {/* Talk back toggle button removed */}
      
      {/* Main voice control button */}
      <motion.button
        ref={buttonRef}
        className={getButtonClasses()}
        onClick={toggleListening}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={status === 'listening' ? { scale: [1,1.05,1] } : {}}
        transition={status === 'listening' ? { scale: { repeat: Infinity, duration: 1.5 } } : {}}
      >
        {status === 'processing' ? <Loader2 className="h-5 w-5 animate-spin" />
         : status === 'error' ? <MicOff className="h-5 w-5" />
         : <Mic className="h-5 w-5" />}
        {status === 'listening' && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-teal-400"
            animate={{ scale: [1,1.2,1], opacity: [0.7,0,0.7] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {transcript && (
          <motion.div
            className="absolute bottom-0 right-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white px-4 py-2 rounded-lg shadow-lg min-w-[180px] text-center border border-slate-200 dark:border-slate-700 z-50"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <span className="text-sm font-medium">{transcript}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}