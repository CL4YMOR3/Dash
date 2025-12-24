// OSRM API integration for realistic road routing

// OSRM API endpoint - using the demo server for development
// In production, you should use your own OSRM instance or a commercial service
const OSRM_API_URL = "https://router.project-osrm.org/route/v1"

// Transport mode - can be driving, walking, cycling
const DEFAULT_TRANSPORT_MODE = "driving"

export interface OSRMRouteOptions {
  coordinates: [number, number][] // Array of [longitude, latitude] pairs
  steps?: boolean
  geometries?: "polyline" | "polyline6" | "geojson"
  overview?: "simplified" | "full" | "false"
  annotations?: boolean
  transportMode?: string
}

export interface OSRMRoute {
  geometry: {
    coordinates: [number, number][] // Array of [longitude, latitude] pairs
    type: string
  }
  distance: number // in meters
  duration: number // in seconds
  legs: any[]
}

/**
 * Get a route between multiple coordinates using OSRM
 * @param options Routing options
 * @returns Promise with route data
 */
export async function getRoute(options: OSRMRouteOptions): Promise<OSRMRoute | null> {
  try {
    // OSRM requires coordinates in [longitude, latitude] format
    // But our app uses [latitude, longitude], so we need to swap them
    const swappedCoordinates = options.coordinates.map((coord) => [coord[1], coord[0]])

    // Format coordinates for the API request
    const coordinatesString = swappedCoordinates.map((coord) => `${coord[0]},${coord[1]}`).join(";")

    // Build the API URL
    const transportMode = options.transportMode || DEFAULT_TRANSPORT_MODE
    const url = `${OSRM_API_URL}/${transportMode}/${coordinatesString}`

    // Add query parameters
    const params = new URLSearchParams({
      steps: (options.steps ?? true).toString(),
      geometries: options.geometries ?? "geojson",
      overview: options.overview ?? "full",
      annotations: (options.annotations ?? true).toString(),
    })

    // Make the API request
    const response = await fetch(`${url}?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Check if we have a valid route
    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      console.error("No route found:", data)
      return null
    }

    // Return the best route
    const route = data.routes[0]

    // Convert coordinates back to [latitude, longitude] format for our app
    if (route.geometry && route.geometry.coordinates) {
      route.geometry.coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])
    }

    return route
  } catch (error) {
    console.error("Error fetching route from OSRM:", error)
    return null
  }
}

/**
 * Calculate estimated time of arrival based on route duration
 * @param durationSeconds Duration in seconds from OSRM
 * @returns Formatted ETA string (e.g., "10 min")
 */
export function calculateETA(durationSeconds: number): string {
  const minutes = Math.ceil(durationSeconds / 60)
  return `${minutes} min`
}

/**
 * Format distance from meters to kilometers
 * @param distanceMeters Distance in meters from OSRM
 * @returns Formatted distance string (e.g., "1.2 km")
 */
export function formatDistance(distanceMeters: number): string {
  const kilometers = (distanceMeters / 1000).toFixed(1)
  return `${kilometers} km`
}

/**
 * Fallback function to generate a route when OSRM API fails
 * This uses a simple algorithm to follow the road network
 * @param start Starting coordinates [latitude, longitude]
 * @param end Ending coordinates [latitude, longitude]
 * @param roadNetwork Array of road segments
 * @returns Array of coordinates representing the route
 */
export function generateFallbackRoute(
  start: [number, number],
  end: [number, number],
  roadNetwork: [number, number][][],
): [number, number][] {
  // Simple implementation to find a path through the road network
  const route: [number, number][] = [start]

  // Find nearest road points to start and end
  const startRoadPoint = findNearestRoadPoint(start, roadNetwork)
  const endRoadPoint = findNearestRoadPoint(end, roadNetwork)

  if (startRoadPoint !== start) {
    route.push(startRoadPoint)
  }

  // Find a path between the road points
  const intermediatePath = findPathThroughRoadNetwork(startRoadPoint, endRoadPoint, roadNetwork)

  route.push(...intermediatePath)

  if (endRoadPoint !== end) {
    route.push(endRoadPoint)
  }

  route.push(end)

  return route
}

/**
 * Find the nearest point on the road network to a given point
 */
function findNearestRoadPoint(point: [number, number], roadNetwork: [number, number][][]): [number, number] {
  let nearestPoint = point
  let minDistance = Number.MAX_VALUE

  roadNetwork.forEach((road) => {
    road.forEach((roadPoint) => {
      const distance = calculateDistance(point, roadPoint)

      if (distance < minDistance) {
        minDistance = distance
        nearestPoint = roadPoint
      }
    })
  })

  return nearestPoint
}

/**
 * Calculate distance between two points
 */
function calculateDistance(point1: [number, number], point2: [number, number]): number {
  return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2))
}

/**
 * Find a path through the road network
 * This is a simplified implementation and not a true shortest path algorithm
 */
function findPathThroughRoadNetwork(
  start: [number, number],
  end: [number, number],
  roadNetwork: [number, number][][],
): [number, number][] {
  // For this simplified version, we'll just find roads that connect
  // and try to get closer to the destination
  const path: [number, number][] = []
  let currentPoint = start
  const maxIterations = 10 // Prevent infinite loops
  let iterations = 0

  while (!arePointsEqual(currentPoint, end) && iterations < maxIterations) {
    iterations++

    // Find a road segment that contains the current point
    const connectedRoads = findConnectedRoads(currentPoint, roadNetwork)

    if (connectedRoads.length === 0) {
      break // No connected roads, can't continue
    }

    // Find the road that gets us closest to the destination
    let bestNextPoint = currentPoint
    let bestDistance = calculateDistance(currentPoint, end)

    for (const road of connectedRoads) {
      // Get the other end of the road
      const otherEnd = arePointsEqual(road[0], currentPoint) ? road[1] : road[0]
      const distance = calculateDistance(otherEnd, end)

      if (distance < bestDistance) {
        bestDistance = distance
        bestNextPoint = otherEnd
      }
    }

    if (arePointsEqual(bestNextPoint, currentPoint)) {
      break // Can't get any closer
    }

    path.push(bestNextPoint)
    currentPoint = bestNextPoint
  }

  return path
}

/**
 * Check if two points are equal
 */
function arePointsEqual(point1: [number, number], point2: [number, number]): boolean {
  return point1[0] === point2[0] && point1[1] === point2[1]
}

/**
 * Find roads connected to a point
 */
function findConnectedRoads(point: [number, number], roadNetwork: [number, number][][]): [number, number][][] {
  return roadNetwork.filter((road) => arePointsEqual(road[0], point) || arePointsEqual(road[1], point))
}
