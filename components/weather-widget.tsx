"use client"

import { useState, useEffect } from "react"
import { Sun, Cloud, CloudSun, CloudRain, Thermometer, Wind, Droplets } from "lucide-react"
import { getCurrentWeather } from "@/lib/weather"
import { useTheme } from "@/lib/theme-context"

interface WeatherData {
  location: string
  temperature: number
  condition: string
  icon: string
  humidity: number
  windSpeed: number
  feelsLike: number
  lastUpdated: string
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()
  const isLightMode = theme === "light"

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        const data = await getCurrentWeather()
        setWeather(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching weather:", err)
        setError("Could not load weather data")
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()

    // Refresh weather data every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Get weather icon based on condition
  const getWeatherIcon = () => {
    if (!weather) return <Sun className="h-6 w-6" />

    switch (weather.icon) {
      case "sun":
        return <Sun className="h-6 w-6 text-amber-500 dark:text-amber-400 theme-transition" />
      case "cloud":
        return <Cloud className="h-6 w-6 text-slate-500 dark:text-slate-400 theme-transition" />
      case "cloud-sun":
        return <CloudSun className="h-6 w-6 text-cyan-600 dark:text-cyan-400 theme-transition" />
      case "cloud-rain":
        return <CloudRain className="h-6 w-6 text-blue-600 dark:text-blue-400 theme-transition" />
      default:
        return <Sun className="h-6 w-6 text-amber-500 dark:text-amber-400 theme-transition" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-slate-600 dark:text-slate-400 text-sm theme-transition">{error}</div>
  }

  if (!weather) {
    return null
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-slate-500/5 transition-transform hover:scale-110">
            {getWeatherIcon()}
          </div>
          <div className="flex flex-col">
            <div className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white theme-transition">
              {Math.round(weather.temperature)}°C
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{weather.condition}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <WeatherDetail icon={<Thermometer className="h-3 w-3" />} label="FEELS" value={`${Math.round(weather.feelsLike)}°`} color="text-pink-500" />
        <WeatherDetail icon={<Wind className="h-3 w-3" />} label="WIND" value={`${Math.round(weather.windSpeed)}k`} color="text-cyan-500" />
        <WeatherDetail icon={<Droplets className="h-3 w-3" />} label="HUMID" value={`${weather.humidity}%`} color="text-blue-500" />
      </div>

      <div className="pt-2 border-t border-white/5">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 text-center">{weather.location}</div>
      </div>
    </div>
  )
}

function WeatherDetail({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-500/5 border border-white/5">
      <div className={`${color} mb-1`}>{icon}</div>
      <div className="text-[8px] font-black uppercase tracking-tighter opacity-30">{label}</div>
      <div className="text-xs font-black">{value}</div>
    </div>
  )
}
