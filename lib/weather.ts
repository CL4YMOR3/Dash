import { config } from "./config"

// Weather API functions using WeatherAPI.com
// API key configured in .env.local

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

// Function to get current weather for NSHM Knowledge Campus Durgapur
export async function getCurrentWeather(): Promise<WeatherData> {
  try {
    // Use API key from centralized config
    const apiKey = config.api.weatherApiKey
    const location = config.campus.location

    const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&aqi=no`)

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()

    // Map the API response to our WeatherData interface
    return {
      location: config.campus.name,
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
      // Map weather condition to our icon names
      icon: mapConditionToIcon(data.current.condition.code),
      humidity: data.current.humidity,
      windSpeed: data.current.wind_kph,
      feelsLike: data.current.feelslike_c,
      lastUpdated: data.current.last_updated,
    }
  } catch (error) {
    console.error("Error fetching weather data:", error)

    // Fallback to mock data if API call fails
    return {
      location: config.campus.name,
      temperature: 28,
      condition: "Sunny",
      icon: "sun",
      humidity: 65,
      windSpeed: 12,
      feelsLike: 30,
      lastUpdated: new Date().toISOString(),
    }
  }
}

// Helper function to map WeatherAPI condition codes to our icon names
function mapConditionToIcon(conditionCode: number): string {
  // Sunny conditions
  if ([1000].includes(conditionCode)) {
    return "sun"
  }

  // Partly cloudy conditions
  if ([1003, 1006].includes(conditionCode)) {
    return "cloud-sun"
  }

  // Cloudy conditions
  if ([1009, 1030, 1135, 1147].includes(conditionCode)) {
    return "cloud"
  }

  // Rainy conditions
  if (
    [
      1063, 1069, 1072, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246,
    ].includes(conditionCode)
  ) {
    return "cloud-rain"
  }

  // Default to sun if condition code is not recognized
  return "sun"
}
