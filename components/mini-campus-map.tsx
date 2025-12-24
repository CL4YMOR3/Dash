"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, School, Coffee, Book, Home, Utensils, Building } from "lucide-react"
import { useTheme } from "next-themes"

// Define the location type
interface Location {
  name: string
  coordinates: [number, number]
  distance?: string
  eta?: string
  traffic?: string
  type?: "start" | "end" | "waypoint"
}

interface MiniCampusMapProps {
  location: Location
  zoom?: number
}

// Helper function to get icon based on location name
const getLocationIcon = (name: string) => {
  const lowerName = name.toLowerCase()

  if (lowerName.includes("hostel")) return Home
  if (lowerName.includes("cafe") || lowerName.includes("canteen")) return Coffee
  if (lowerName.includes("library")) return Book
  if (lowerName.includes("admin")) return Building
  if (lowerName.includes("gate")) return MapPin
  if (lowerName.includes("block")) return School
  if (lowerName.includes("building")) return Building

  return MapPin
}

// Map styles for colorful map
const mapStyles = {
  colorful: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
}

export default function MiniCampusMap({ location, zoom = 17 }: MiniCampusMapProps) {
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapReady, setMapReady] = useState(false)
  const [leaflet, setLeaflet] = useState<any>(null)
  const { resolvedTheme } = useTheme()
  const [isClient, setIsClient] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Dynamically import Leaflet on the client side only
  useEffect(() => {
    if (!isClient) return

    const loadLeaflet = async () => {
      try {
        // Import Leaflet directly
        const L = await import("leaflet")

        // Import CSS
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link")
          link.id = "leaflet-css"
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          link.crossOrigin = ""
          document.head.appendChild(link)
        }

        setLeaflet(L)
      } catch (error) {
        console.error("Error loading Leaflet:", error)
        setLoadError("Failed to load map library")

        // Fallback attempt to load from a CDN
        try {
          if (!document.getElementById("leaflet-script")) {
            const script = document.createElement("script")
            script.id = "leaflet-script"
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            script.crossOrigin = ""

            const link = document.createElement("link")
            link.id = "leaflet-css"
            link.rel = "stylesheet"
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
            link.crossOrigin = ""

            document.head.appendChild(link)

            script.onload = () => {
              // @ts-ignore - Leaflet will be available on window
              setLeaflet(window.L)
            }

            document.body.appendChild(script)
          }
        } catch (fallbackError) {
          console.error("Fallback Leaflet loading also failed:", fallbackError)
          setLoadError("Failed to load map library (fallback also failed)")
        }
      }
    }

    loadLeaflet()
  }, [isClient])

  // Create custom icon function
  const createCustomIcon = (location: Location) => {
    if (!leaflet) return null

    try {
      const L = leaflet

      // Create a DOM element for the custom icon
      const iconHtml = document.createElement("div")
      iconHtml.className = "custom-marker-icon"

      // Set styles
      iconHtml.style.backgroundColor = "#3b82f6" // Blue background
      iconHtml.style.color = "#ffffff"
      iconHtml.style.width = "30px"
      iconHtml.style.height = "30px"
      iconHtml.style.borderRadius = "50%"
      iconHtml.style.display = "flex"
      iconHtml.style.alignItems = "center"
      iconHtml.style.justifyContent = "center"
      iconHtml.style.border = "3px solid #2563eb"
      iconHtml.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)"

      // Create SVG icon
      const svgNS = "http://www.w3.org/2000/svg"
      const svg = document.createElementNS(svgNS, "svg")
      svg.setAttribute("width", "16")
      svg.setAttribute("height", "16")
      svg.setAttribute("viewBox", "0 0 24 24")
      svg.setAttribute("fill", "none")
      svg.setAttribute("stroke", "currentColor")
      svg.setAttribute("stroke-width", "2")
      svg.setAttribute("stroke-linecap", "round")
      svg.setAttribute("stroke-linejoin", "round")

      // Determine which icon to use based on location name
      const LocationIconComponent = getLocationIcon(location.name)
      let pathData = ""

      if (LocationIconComponent === MapPin) {
        pathData = "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
      } else if (LocationIconComponent === Home) {
        pathData = "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10"
      } else if (LocationIconComponent === Coffee) {
        pathData = "M18 8h1a4 4 0 0 1 0 8h-1 M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z M6 1v3 M10 1v3 M14 1v3"
      } else if (LocationIconComponent === Book) {
        pathData = "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
      } else if (LocationIconComponent === Building) {
        pathData =
          "M6 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2 M12 12v10 M12 2v4"
      } else if (LocationIconComponent === School) {
        pathData = "M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5"
      } else if (LocationIconComponent === Utensils) {
        pathData =
          "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M19 2v20M15 2c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2z"
      }

      const path = document.createElementNS(svgNS, "path")
      path.setAttribute("d", pathData)
      svg.appendChild(path)
      iconHtml.appendChild(svg)

      return L.divIcon({
        html: iconHtml,
        className: "custom-marker",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })
    } catch (error) {
      console.error("Error creating custom icon:", error)
      return null
    }
  }

  // Initialize map
  useEffect(() => {
    if (!leaflet || !mapContainerRef.current || mapRef.current || !isClient) return

    try {
      const L = leaflet

      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: location.coordinates,
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        touchZoom: false,
      })

      // Use colorful map style
      L.tileLayer(mapStyles.colorful, {
        maxZoom: 20,
        attribution: "",
      }).addTo(map)

      // Add marker for the location
      const icon = createCustomIcon(location)
      if (icon) {
        const marker = L.marker(location.coordinates, {
          icon,
          title: location.name,
        }).addTo(map)

        // Add popup
        marker.bindPopup(
          `
          <div style="text-align: center;">
            <div style="font-weight: bold; margin-bottom: 4px;">${location.name}</div>
            ${location.distance ? `<div>Distance: ${location.distance}</div>` : ""}
            ${location.eta ? `<div>ETA: ${location.eta}</div>` : ""}
          </div>
        `,
          {
            closeButton: false,
            className: "mini-map-popup",
          },
        )

        markerRef.current = marker
      }

      mapRef.current = map
      setMapReady(true)

      // Cleanup on unmount
      return () => {
        if (mapRef.current) {
          try {
            mapRef.current.remove()
            mapRef.current = null
            markerRef.current = null
          } catch (error) {
            console.error("Error removing map:", error)
          }
        }
      }
    } catch (error) {
      console.error("Error initializing map:", error)
      setLoadError("Failed to initialize map")
    }
  }, [leaflet, location, zoom, isClient])

  // Update marker position when location changes
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !leaflet) return

    try {
      // Update marker position
      markerRef.current.setLatLng(location.coordinates)

      // Update popup content
      markerRef.current.setPopupContent(`
        <div style="text-align: center;">
          <div style="font-weight: bold; margin-bottom: 4px;">${location.name}</div>
          ${location.distance ? `<div>Distance: ${location.distance}</div>` : ""}
          ${location.eta ? `<div>ETA: ${location.eta}</div>` : ""}
        </div>
      `)

      // Pan map to new location
      mapRef.current.panTo(location.coordinates)
    } catch (error) {
      console.error("Error updating marker position:", error)
    }
  }, [location, leaflet])

  // Handle window resize to ensure map renders correctly
  useEffect(() => {
    if (!mapRef.current || !isClient) return

    const handleResize = () => {
      if (mapRef.current) {
        try {
          mapRef.current.invalidateSize()
        } catch (error) {
          console.error("Error invalidating map size:", error)
        }
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [mapRef, isClient])

  return (
    <div ref={mapContainerRef} className="w-full h-full rounded-md overflow-hidden relative">
      {(!leaflet || !isClient) && (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {loadError && (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900">
          <div className="text-center p-4">
            <div className="text-red-500 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-slate-700 dark:text-slate-300">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
