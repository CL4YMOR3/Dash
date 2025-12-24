/**
 * Application configuration with environment variable handling
 * Centralizes all configuration to make it easier to manage
 */
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
    weatherApiKey: process.env.WEATHER_API_KEY || "fd700e7d5a7442239c7150136240905",
  },
  maps: {
    defaultCenter: [23.516838, 87.376387] as [number, number],
    defaultZoom: 17,
    tileProvider:
      process.env.NEXT_PUBLIC_MAP_TILE_PROVIDER ||
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  },
  features: {
    enableVoiceCommands: process.env.NEXT_PUBLIC_ENABLE_VOICE_COMMANDS !== "false",
    enableWeather: process.env.NEXT_PUBLIC_ENABLE_WEATHER !== "false",
  },
  campus: {
    name: "NSHM Knowledge Campus, Durgapur",
    location: "Durgapur,West Bengal,India",
  },
}

/**
 * Validates required environment variables
 * Should be called during app initialization on the server
 */
export function validateConfig() {
  const requiredServerVars = ["WEATHER_API_KEY"]
  const missing = requiredServerVars.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.warn(`Warning: Missing recommended environment variables: ${missing.join(", ")}`)
    console.warn("Using default values which may not be suitable for production")
  }
}
