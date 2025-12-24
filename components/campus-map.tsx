"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, School, Coffee, Book, Home, Utensils, Building } from "lucide-react"
import { useTheme } from "next-themes"
import { getRoute, generateFallbackRoute, formatDistance, calculateETA } from "@/lib/osrm"

// Define the location type
interface Location {
  name: string
  coordinates: [number, number]
  distance?: string
  eta?: string
  traffic?: string
  type?: "start" | "end" | "waypoint"
}

interface CampusMapProps {
  locations: Location[]
  activeLocation: string | null
  selectedLocations: string[]
  onMarkerClick: (locationName: string) => void
  showRoute?: boolean
  forceLight?: boolean
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

// Campus road network coordinates - simplified for demonstration
const roadNetwork: [number, number][][] = [
  // Main roads
  [
    [23.517138, 87.377658],
    [23.516652, 87.377127],
  ], // Gate 1 to Admin
  [
    [23.516652, 87.377127],
    [23.51704, 87.376982],
  ], // Admin to MBA Block
  [
    [23.51704, 87.376982],
    [23.517591, 87.377132],
  ], // MBA Block to ITES Building
  [
    [23.517591, 87.377132],
    [23.516888, 87.376698],
  ], // ITES Building to Management Block
  [
    [23.516888, 87.376698],
    [23.51677, 87.376456],
  ], // Management Block to D Block
  [
    [23.51677, 87.376456],
    [23.516686, 87.376124],
  ], // D Block to E Block
  [
    [23.516686, 87.376124],
    [23.515919, 87.375517],
  ], // E Block to Boys Hostel
  [
    [23.515919, 87.375517],
    [23.516996, 87.374241],
  ], // Boys Hostel to Girls Hostel
  [
    [23.516996, 87.374241],
    [23.517512, 87.374536],
  ], // Girls Hostel to Canteen
  [
    [23.517512, 87.374536],
    [23.516691, 87.376387],
  ], // Canteen to Library
  [
    [23.516691, 87.376387],
    [23.516838, 87.377148],
  ], // Library to Cafe
  [
    [23.516838, 87.377148],
    [23.517138, 87.377658],
  ], // Cafe to Gate 1

  // Cross connections
  [
    [23.516652, 87.377127],
    [23.516691, 87.376387],
  ], // Admin to Library
  [
    [23.51704, 87.376982],
    [23.516888, 87.376698],
  ], // MBA Block to Management Block
  [
    [23.516888, 87.376698],
    [23.516691, 87.376387],
  ], // Management Block to Library
  [
    [23.516686, 87.376124],
    [23.516996, 87.374241],
  ], // E Block to Girls Hostel
  [
    [23.517512, 87.374536],
    [23.517591, 87.377132],
  ], // Canteen to ITES Building
]

// Map styles for colorful map
const mapStyles = {
  colorful: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  outdoors: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
}

// Calculate distance between two points in kilometers
const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
  const R = 6371 // Radius of the Earth in km
  const dLat = ((point2[0] - point1[0]) * Math.PI) / 180
  const dLon = ((point2[1] - point1[1]) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1[0] * Math.PI) / 180) *
      Math.cos((point2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Sort locations by distance from starting point
const sortLocationsByDistance = (startLocation: Location, locations: Location[]): Location[] => {
  return [...locations].sort((a, b) => {
    const distA = calculateDistance(startLocation.coordinates, a.coordinates)
    const distB = calculateDistance(startLocation.coordinates, b.coordinates)
    return distA - distB
  })
}

export default function CampusMap({
  locations,
  activeLocation,
  selectedLocations,
  onMarkerClick,
  showRoute = false,
  forceLight = false,
}: CampusMapProps) {
  const mapRef = useRef<any>(null)
  const markersRef = useRef<{ [key: string]: any }>({})
  const routeLayerRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapReady, setMapReady] = useState(false)
  const [leaflet, setLeaflet] = useState<any>(null)
  const { resolvedTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState(resolvedTheme)
  const [isClient, setIsClient] = useState(false)
  const [startLocation, setStartLocation] = useState<Location | null>(null)
  const [endLocations, setEndLocations] = useState<Location[]>([])
  const [sortedLocations, setSortedLocations] = useState<Location[]>([])
  const [routeData, setRouteData] = useState<any>(null)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Process selected locations to determine start and end points
  useEffect(() => {
    if (selectedLocations.length === 0) {
      setStartLocation(null)
      setEndLocations([])
      setSortedLocations([])
      return
    }

    // First selected location is the starting point
    const start = locations.find((loc) => loc.name === selectedLocations[0])
    if (!start) return

    // Set start location with type
    const startWithType = { ...start, type: "start" as const }
    setStartLocation(startWithType)

    // Remaining locations are end points
    const ends = selectedLocations
      .slice(1)
      .map((name) => {
        const loc = locations.find((l) => l.name === name)
        return loc ? { ...loc, type: "end" as const } : null
      })
      .filter(Boolean) as Location[]

    setEndLocations(ends)

    // Sort end locations by distance from start
    if (ends.length > 0) {
      const sorted = sortLocationsByDistance(startWithType, ends)
      setSortedLocations([startWithType, ...sorted])
    } else {
      setSortedLocations([startWithType])
    }
  }, [selectedLocations, locations])

  // Dynamically import Leaflet on the client side only
  useEffect(() => {
    if (!isClient) return

    const loadLeaflet = async () => {
      try {
        // Import Leaflet directly from node_modules
        const L = await import("leaflet")

        // Import CSS from unpkg CDN
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)

        setLeaflet(L)
      } catch (error) {
        console.error("Error loading Leaflet:", error)

        // Fallback attempt to load from a CDN if the direct import fails
        try {
          // Use unpkg as a fallback CDN with the exact version
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.crossOrigin = ""

          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          link.crossOrigin = ""

          document.head.appendChild(link)

          script.onload = () => {
            // @ts-ignore - Leaflet will be available on window
            setLeaflet(window.L)
          }

          document.body.appendChild(script)
        } catch (fallbackError) {
          console.error("Fallback Leaflet loading also failed:", fallbackError)
        }
      }
    }

    loadLeaflet()
  }, [isClient])

  // Track theme changes
  useEffect(() => {
    if (resolvedTheme !== currentTheme) {
      setCurrentTheme(resolvedTheme)

      // If map is already initialized, update the tile layer
      if (mapRef.current && leaflet) {
        updateMapTheme(resolvedTheme)
      }
    }
  }, [resolvedTheme, currentTheme])

  // Function to update map theme
  const updateMapTheme = (theme: string | undefined) => {
    if (!mapRef.current || !leaflet) return

    const L = leaflet
    const map = mapRef.current

    // Remove existing tile layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    // Always use colorful theme for better visualization
    L.tileLayer(mapStyles.colorful, {
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    // Update markers to match theme
    updateMarkers()
  }

  // Initialize map
  useEffect(() => {
    if (!leaflet || !mapContainerRef.current || mapRef.current || !isClient) return

    try {
      const L = leaflet

      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: [23.516838, 87.376387], // Center of the campus
        zoom: 17,
        zoomControl: false,
        attributionControl: true,
      })

      // Use colorful map style for better visualization
      L.tileLayer(mapStyles.colorful, {
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Add zoom control to top-right
      L.control
        .zoom({
          position: "topright",
        })
        .addTo(map)

      // Calculate bounds to fit all locations
      if (locations.length > 0) {
        const bounds = L.latLngBounds(locations.map((loc) => L.latLng(loc.coordinates[0], loc.coordinates[1])))
        map.fitBounds(bounds, { padding: [50, 50] })
      }

      // Handle resize events to ensure map fills container
      const handleResize = () => {
        if (map && mapRef.current) {
          setTimeout(() => {
            try {
              map.invalidateSize()
            } catch (error) {
              console.error("Error invalidating map size:", error)
            }
          }, 100)
        }
      }

      window.addEventListener("resize", handleResize)

      mapRef.current = map
      setMapReady(true)

      // Cleanup on unmount
      return () => {
        window.removeEventListener("resize", handleResize)
        if (mapRef.current) {
          try {
            mapRef.current.remove()
          } catch (error) {
            console.error("Error removing map:", error)
          }
          mapRef.current = null
        }
      }
    } catch (error) {
      console.error("Error initializing map:", error)
    }
  }, [leaflet, locations, resolvedTheme, isClient, forceLight, mapStyles.colorful])

  // Function to update all markers
  const updateMarkers = () => {
    if (!mapReady || !mapRef.current || !leaflet) return

    try {
      // Update all markers
      locations.forEach((location) => {
        const marker = markersRef.current[location.name]
        if (!marker) return

        const isActive = activeLocation === location.name
        const isSelected = selectedLocations.includes(location.name)
        const locationType =
          selectedLocations.indexOf(location.name) === 0
            ? "start"
            : selectedLocations.includes(location.name)
              ? "end"
              : undefined

        // Update icon
        marker.setIcon(createCustomIcon(location, isActive, isSelected, locationType))

        // Handle popup and panning
        if (isActive) {
          marker.openPopup()
          mapRef.current?.panTo([location.coordinates[0], location.coordinates[1]])
        }
      })
    } catch (error) {
      console.error("Error updating markers:", error)
    }
  }

  // Create custom icon function with vibrant colors
  const createCustomIcon = (location: Location, isActive: boolean, isSelected: boolean, locationType?: string) => {
    if (!leaflet) return null

    try {
      const L = leaflet

      // Determine icon color based on location type
      let bgColor, textColor, borderColor

      if (locationType === "start") {
        bgColor = "#10b981" // Green for start
        textColor = "#ffffff"
        borderColor = "#059669"
      } else if (locationType === "end") {
        bgColor = "#3b82f6" // Blue for end
        textColor = "#ffffff"
        borderColor = "#2563eb"
      } else if (isSelected) {
        bgColor = "#8b5cf6" // Purple for selected
        textColor = "#ffffff"
        borderColor = "#7c3aed"
      } else {
        bgColor = "#f3f4f6" // Light gray for unselected
        textColor = "#4b5563"
        borderColor = "#d1d5db"
      }

      if (isActive) {
        borderColor = "#ef4444" // Red border for active
      }

      // Create a DOM element for the custom icon
      const iconHtml = document.createElement("div")
      iconHtml.className = `custom-marker-icon ${isActive ? "active" : ""} ${isSelected ? "selected" : ""} ${locationType ? `map-marker-${locationType}` : ""}`

      // Set styles with vibrant colors
      iconHtml.style.backgroundColor = bgColor
      iconHtml.style.color = textColor
      iconHtml.style.width = "40px"
      iconHtml.style.height = "40px"
      iconHtml.style.borderRadius = "50%"
      iconHtml.style.display = "flex"
      iconHtml.style.alignItems = "center"
      iconHtml.style.justifyContent = "center"
      iconHtml.style.border = `3px solid ${borderColor}`
      iconHtml.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)"
      iconHtml.style.transition = "all 0.3s ease"

      // Create SVG icon
      const svgNS = "http://www.w3.org/2000/svg"
      const svg = document.createElementNS(svgNS, "svg")
      svg.setAttribute("width", "22")
      svg.setAttribute("height", "22")
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

      // Add a label for start/end if needed
      if (locationType) {
        const label = document.createElement("div")
        label.style.position = "absolute"
        label.style.top = "-20px"
        label.style.left = "50%"
        label.style.transform = "translateX(-50%)"
        label.style.backgroundColor = locationType === "start" ? "#10b981" : "#3b82f6"
        label.style.color = "#ffffff"
        label.style.padding = "2px 6px"
        label.style.borderRadius = "4px"
        label.style.fontSize = "10px"
        label.style.fontWeight = "bold"
        label.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)"
        label.textContent = locationType === "start" ? "START" : "END"
        iconHtml.appendChild(label)
      }

      return L.divIcon({
        html: iconHtml,
        className: "custom-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })
    } catch (error) {
      console.error("Error creating custom icon:", error)
      return null
    }
  }

  // Fetch route using OSRM API
  const fetchRoute = async (start: Location, end: Location) => {
    setIsLoadingRoute(true)

    try {
      // Call OSRM API to get the route
      const route = await getRoute({
        coordinates: [start.coordinates, end.coordinates],
        steps: true,
        geometries: "geojson",
        overview: "full",
        annotations: true,
      })

      if (route) {
        return {
          coordinates: route.geometry.coordinates,
          distance: formatDistance(route.distance),
          duration: calculateETA(route.duration),
        }
      } else {
        // If OSRM fails, use fallback route generation
        console.log("Using fallback route generation")
        const fallbackCoordinates = generateFallbackRoute(start.coordinates, end.coordinates, roadNetwork)

        // Estimate distance and duration
        const distance = calculateDistance(start.coordinates, end.coordinates) * 1.3 // Add 30% for road vs straight line
        const duration = distance * 2 * 60 // Rough estimate: 2 min per km

        return {
          coordinates: fallbackCoordinates,
          distance: `${distance.toFixed(1)} km`,
          duration: `${Math.ceil(duration / 60)} min`,
        }
      }
    } catch (error) {
      console.error("Error fetching route:", error)
      return null
    } finally {
      setIsLoadingRoute(false)
    }
  }

  // Draw route between locations using OSRM API
  useEffect(() => {
    if (!mapReady || !mapRef.current || !leaflet || !showRoute) return;

    const fetchAndDrawRoutes = async () => {
      try {
        const L = leaflet;
        const map = mapRef.current;

        if (!map) {
          console.error("Map instance is not available");
          return;
        }

        // Remove existing route if any
        if (routeLayerRef.current) {
          map.removeLayer(routeLayerRef.current);
          routeLayerRef.current = null;
        }

        if (sortedLocations.length >= 2) {
          const allLayers = [];

          for (let i = 0; i < sortedLocations.length - 1; i++) {
            const start = sortedLocations[i];
            const end = sortedLocations[i + 1];

            const routeData = await fetchRoute(start, end);
            if (!routeData) continue;

            const routeLine = L.polyline(routeData.coordinates, {
              color: "#3b82f6",
              weight: 5,
              opacity: 0.8,
            }).addTo(map);

            allLayers.push(routeLine);
          }

          routeLayerRef.current = L.layerGroup(allLayers).addTo(map);
        }
      } catch (error) {
        console.error("Error in fetchAndDrawRoutes:", error);
      }
    };

    fetchAndDrawRoutes();
  }, [mapReady, leaflet, sortedLocations, showRoute]);

  // Add markers for all locations
  useEffect(() => {
    if (!mapReady || !mapRef.current || !leaflet || !isClient) return

    try {
      const L = leaflet

      // Clear existing markers
      Object.values(markersRef.current).forEach((marker: any) => {
        try {
          marker.remove()
        } catch (error) {
          console.error("Error removing marker:", error)
        }
      })
      markersRef.current = {}

      // Add markers for each location
      locations.forEach((location) => {
        const isActive = activeLocation === location.name
        const isSelected = selectedLocations.includes(location.name)
        const locationType =
          selectedLocations.indexOf(location.name) === 0
            ? "start"
            : selectedLocations.includes(location.name)
              ? "end"
              : undefined

        const icon = createCustomIcon(location, isActive, isSelected, locationType)
        if (!icon) return

        const marker = L.marker([location.coordinates[0], location.coordinates[1]], {
          icon,
          title: location.name,
          riseOnHover: true,
        }).addTo(mapRef.current)

        // Add popup
        const popupContent = `
          <div style="text-align: center;">
            <div style="font-weight: bold; margin-bottom: 4px;">${location.name}</div>
            ${location.distance ? `<div>Distance: ${location.distance}</div>` : ""}
            ${location.eta ? `<div>ETA: ${location.eta}</div>` : ""}
            ${
              locationType
                ? `<div style="margin-top: 4px; font-weight: bold; color: ${locationType === "start" ? "#10b981" : "#3b82f6"}">
              ${locationType.toUpperCase()} POINT
            </div>`
                : ""
            }
          </div>
        `

        marker.bindPopup(popupContent, {
          closeButton: false,
          className: `custom-popup ${forceLight ? "light-theme" : resolvedTheme === "dark" ? "dark-theme" : "light-theme"}`,
        })

        // Add click handler
        marker.on("click", () => {
          onMarkerClick(location.name)
        })

        // Store marker reference
        markersRef.current[location.name] = marker

        // If active, open popup
        if (isActive && mapRef.current) {
          marker.openPopup()
          mapRef.current.panTo([location.coordinates[0], location.coordinates[1]])
        }
      })

      // Add custom CSS for popups
      const styleId = "leaflet-custom-styles"
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style")
        style.id = styleId
        style.innerHTML = `
          .custom-popup.dark-theme .leaflet-popup-content-wrapper {
            background-color: rgba(30, 41, 59, 0.9);
            color: white;
            border-radius: 8px;
            padding: 0;
            backdrop-filter: blur(4px);
            border: 1px solid rgba(71, 85, 105, 0.5);
          }
          .custom-popup.dark-theme .leaflet-popup-tip {
            background-color: rgba(30, 41, 59, 0.9);
            border: 1px solid rgba(71, 85, 105, 0.5);
          }
          
          .custom-popup.light-theme .leaflet-popup-content-wrapper {
            background-color: rgba(255, 255, 255, 0.9);
            color: #1e293b;
            border-radius: 8px;
            padding: 0;
            backdrop-filter: blur(4px);
            border: 1px solid rgba(203, 213, 225, 0.5);
          }
          .custom-popup.light-theme .leaflet-popup-tip {
            background-color: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(203, 213, 225, 0.5);
          }
          
          .custom-popup .leaflet-popup-content {
            margin: 12px 16px;
            font-family: 'Roboto', sans-serif;
          }
          
          .leaflet-container {
            font-family: 'Roboto', sans-serif;
          }
          
          .arrow-marker {
            background: transparent;
            border: none;
          }
          
          .route-line {
            /* Add subtle animation for the route line */
            stroke-dasharray: 10;
            animation: dash 30s linear infinite;
          }
          
          @keyframes dash {
            to {
              stroke-dashoffset: 1000;
            }
          }
          
          .route-info-popup .leaflet-popup-content-wrapper {
            background-color: rgba(255, 255, 255, 0.95);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          .route-info-popup .leaflet-popup-tip {
            background-color: rgba(255, 255, 255, 0.95);
          }
        `
        document.head.appendChild(style)
      }
    } catch (error) {
      console.error("Error adding markers:", error)
    }
  }, [
    locations,
    activeLocation,
    selectedLocations,
    mapReady,
    leaflet,
    resolvedTheme,
    onMarkerClick,
    isClient,
    forceLight,
  ])

  // Update markers when active location changes
  useEffect(() => {
    if (!mapReady || !mapRef.current || !leaflet || !isClient) return

    try {
      // Update all markers
      locations.forEach((location) => {
        const marker = markersRef.current[location.name]
        if (!marker) return

        const isActive = activeLocation === location.name
        const isSelected = selectedLocations.includes(location.name)
        const locationType =
          selectedLocations.indexOf(location.name) === 0
            ? "start"
            : selectedLocations.includes(location.name)
              ? "end"
              : undefined

        // Update icon
        const icon = createCustomIcon(location, isActive, isSelected, locationType)
        if (icon) {
          marker.setIcon(icon)
        }

        // Handle popup and panning
        if (isActive) {
          marker.openPopup()
          mapRef.current?.panTo([location.coordinates[0], location.coordinates[1]])
        } else {
          marker.closePopup()
        }
      })
    } catch (error) {
      console.error("Error updating markers on active change:", error)
    }
  }, [activeLocation, selectedLocations, locations, mapReady, leaflet, isClient, forceLight])

  return (
    <div ref={mapContainerRef} className="w-full h-full">
      {(!leaflet || !isClient) && (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <div className="text-slate-600 dark:text-white">Loading map...</div>
          </div>
        </div>
      )}

      {isLoadingRoute && (
        <div className="absolute top-2 right-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 rounded-md shadow-md z-20 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-sm">Calculating route...</span>
        </div>
      )}

      {startLocation && (
        <div className="destination-type-indicator destination-type-start">Starting Point: {startLocation.name}</div>
      )}
    </div>
  )
}
