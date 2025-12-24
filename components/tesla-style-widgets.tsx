"use client"

import { Battery, Thermometer, Gauge } from "lucide-react"
import { useTheme } from "@/lib/theme-context"

export default function TeslaStyleWidgets() {
  // Static values for the widget
  const speed = 64
  const batteryPercentage = 92
  const batteryRange = 240
  const engineTemp = 87
  const tirePressure = 36
  const energyConsumption = 128
  const batteryCapacity = 35.5
  const { theme } = useTheme()

  // Calculate the angle for the speedometer
  const maxSpeed = 160
  // Map speed to angle (0-160 km/h maps to 0-180 degrees)
  const arcAngle = (speed / maxSpeed) * 180

  return (
    <div
      className={
        theme === "light"
          ? "tesla-dashboard-panel p-5"
          : "dashboard-panel p-5 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg"
      }
    >
      {/* Car Image and Model */}
      <div className="flex flex-col items-center mb-4">
        <div className="w-full max-w-xs mb-2">
          <img src="/car.png" alt="DASH MODEL S" className="w-full object-contain" />
        </div>
        <div className="text-center">
          <h2 className={theme === "light" ? "text-slate-800 text-lg font-bold" : "text-white text-lg font-bold"}>
            DASH MODEL S
          </h2>
          <p className={theme === "light" ? "text-slate-600 text-xs" : "text-slate-400 text-xs"}>
            2025 Release Edition
          </p>
        </div>
      </div>

      {/* Speedometer */}
      <div className="relative w-full h-36 mb-3">
        {/* Speedometer background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-xs">
            {/* Main gauge track */}
            <svg viewBox="0 0 200 100" className="w-full">
              <path
                d="M20,100 A80,80 0 0,1 180,100"
                stroke={theme === "light" ? "#CBD5E1" : "#334155"}
                strokeWidth="6"
                fill="none"
              />

              {/* Progress gauge - yellow arc */}
              <path
                d="M20,100 A80,80 0 0,1 180,100"
                stroke="#EAB308"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                style={{
                  strokeDasharray: "251.2",
                  strokeDashoffset: `${251.2 - (251.2 * 64) / maxSpeed}`,
                  filter: "drop-shadow(0 0 2px rgba(234, 179, 8, 0.5))",
                }}
              />

              {/* Speed tick marks */}
              {[...Array(9)].map((_, i) => {
                const tickAngle = i * 22.5 // 180 degrees / 8 segments
                const x1 = 100 - 70 * Math.cos((tickAngle * Math.PI) / 180)
                const y1 = 100 - 70 * Math.sin((tickAngle * Math.PI) / 180)
                const x2 = 100 - 80 * Math.cos((tickAngle * Math.PI) / 180)
                const y2 = 100 - 80 * Math.sin((tickAngle * Math.PI) / 180)

                // Text position
                const textX = 100 - 58 * Math.cos((tickAngle * Math.PI) / 180)
                const textY = 100 - 58 * Math.sin((tickAngle * Math.PI) / 180)

                return (
                  <g key={i}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={theme === "light" ? "#94A3B8" : "#94A3B8"}
                      strokeWidth="2"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill={theme === "light" ? "#64748B" : "#94A3B8"}
                      fontSize="8"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {i * 20}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Speed value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
              <div
                className={theme === "light" ? "text-4xl font-bold text-slate-800" : "text-4xl font-bold text-white"}
              >
                {speed}
              </div>
              <div className={theme === "light" ? "text-xs text-slate-600" : "text-xs text-slate-400"}>km/h</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle metrics - matching the Tesla reference image */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="text-center">
          <div className={theme === "light" ? "text-xl font-medium text-slate-800" : "text-xl font-medium text-white"}>
            {batteryRange}
          </div>
          <div className={theme === "light" ? "text-xs text-slate-600" : "text-xs text-slate-400"}>km remaining</div>
        </div>
        <div className="text-center">
          <div className={theme === "light" ? "text-xl font-medium text-slate-800" : "text-xl font-medium text-white"}>
            {energyConsumption}
          </div>
          <div className={theme === "light" ? "text-xs text-slate-600" : "text-xs text-slate-400"}>wh/km average</div>
        </div>
        <div className="text-center">
          <div className={theme === "light" ? "text-xl font-medium text-slate-800" : "text-xl font-medium text-white"}>
            {batteryCapacity}
          </div>
          <div className={theme === "light" ? "text-xs text-slate-600" : "text-xs text-slate-400"}>
            kWh full capacity
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex justify-between items-center mt-4">
        <div
          className={
            theme === "light"
              ? "flex items-center space-x-2 bg-slate-100/80 px-3 py-2 rounded-lg"
              : "flex items-center space-x-2 bg-slate-800/50 px-3 py-2 rounded-md"
          }
        >
          <Battery className="h-4 w-4 text-green-400" />
          <span className={theme === "light" ? "text-sm text-slate-800" : "text-sm text-white"}>
            {batteryPercentage}%
          </span>
        </div>
        <div
          className={
            theme === "light"
              ? "flex items-center space-x-2 bg-slate-100/80 px-3 py-2 rounded-lg"
              : "flex items-center space-x-2 bg-slate-800/50 px-3 py-2 rounded-md"
          }
        >
          <Thermometer className="h-4 w-4 text-blue-400" />
          <span className={theme === "light" ? "text-sm text-slate-800" : "text-sm text-white"}>{engineTemp}°C</span>
        </div>
        <div
          className={
            theme === "light"
              ? "flex items-center space-x-2 bg-slate-100/80 px-3 py-2 rounded-lg"
              : "flex items-center space-x-2 bg-slate-800/50 px-3 py-2 rounded-md"
          }
        >
          <Gauge className="h-4 w-4 text-yellow-400" />
          <span className={theme === "light" ? "text-sm text-slate-800" : "text-sm text-white"}>
            {tirePressure} psi
          </span>
        </div>
      </div>
    </div>
  )
}
