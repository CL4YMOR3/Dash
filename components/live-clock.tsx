"use client"

import { useState, useEffect } from "react"

export default function LiveClock({ className }: { className?: string }) {
    const [time, setTime] = useState<Date | null>(null)

    useEffect(() => {
        setTime(new Date())
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    if (!time) return null

    return (
        <span className={className}>
            {time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            })}
        </span>
    )
}
