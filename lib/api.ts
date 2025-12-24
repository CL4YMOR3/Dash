import { config } from "./config"

// Type definition for voice command response
export interface VoiceCommandResponse {
  success: boolean;
  text?: string;
  command?: string;
  error?: string;
  route?: string;
  startLocation?: string;
  location?: string;
  isNavigation?: boolean;
  timestamp?: number;
  fallback?: boolean;
}

// Send voice command as raw audio
export async function sendVoiceCommand(audioBlob: Blob): Promise<VoiceCommandResponse> {
  try {
    const formData = new FormData()
    formData.append("audio", audioBlob, "voice.webm") // adjust extension if needed

    const response = await fetch(`${config.api.baseUrl}/api/voice-command`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error sending voice command:", error)
    return {
      success: false,
      error: "Failed to connect to voice recognition service",
      fallback: true,
    }
  }
}

// Test connection
export async function testBackendConnection() {
  try {
    const response = await fetch(`${config.api.baseUrl}/api/test`)
    if (!response.ok) throw new Error()
    const data = await response.json()
    return { connected: true, ...data }
  } catch {
    return { connected: false, error: "Could not connect to backend" }
  }
}