import { useMemo } from 'react'

// Basic Shape Interfaces for Hook
interface FarmProfile {
    cropType: string
}

interface LogEntry {
    event: string
}

interface SystemState {
    horizons: { short: { currentDay: number } }
    logs: LogEntry[]
}

export type DialogueLine = {
    speaker: 'Sarah' | 'Mike'
    text: string
}

export function useBriefing(activeProfile: FarmProfile | null, system: SystemState | null) {
    const script = useMemo(() => {
        if (!activeProfile || !system) return []

        const lines: DialogueLine[] = []
        const crop = activeProfile.cropType
        const day = system.horizons.short.currentDay

        // Host 1 (Sarah) - Warm host
        // Host 2 (Mike) - Analytic expert

        // SECTION 1: SYSTEM OVERVIEW
        lines.push({ speaker: 'Sarah', text: `Good morning! Welcome back to your Daily LeafScan Briefing. It's day ${day} for the ${crop}. I was just looking at the system overview, and things are stable.` })
        lines.push({ speaker: 'Mike', text: `That's right Sarah. Stable, but active. The sensors are tracking optimal growth, though soil moisture has been trending slightly lower overnight.` })

        // SECTION 2: WEATHER FORECAST (Simulated Value)
        // In a real app, this would come from a weather API. Here we simulate "Real Value".
        const tomorrowForecast = { temp: '24°C', condition: 'Sunny with high UV' }
        lines.push({ speaker: 'Sarah', text: `Let's look ahead. Tomorrow's forecast is showing ${tomorrowForecast.condition} and about ${tomorrowForecast.temp}.` })
        lines.push({ speaker: 'Mike', text: `High UV means high transpiration. User, make sure your irrigation schedule is set to run *before* noon to prevent heat stress.` })

        // SECTION 3: DEEP DIVE LOGS
        const hasRain = system.logs.some(l => l.event.toLowerCase().includes('rain'))
        if (hasRain) {
            lines.push({ speaker: 'Sarah', text: `We did log that heavy rain event last night. A lot of water in a short time.` })
            lines.push({ speaker: 'Mike', text: `Exactly. And for ${crop}, wet leaves overnight is a recipe for fungal issues. I'd recommend doing a quick visual check for mildew today.` })
        }

        // SECTION 4: ACTION PLAN (The "To-Do" List)
        lines.push({ speaker: 'Sarah', text: `So, bottom line. What's the action plan for today?` })
        lines.push({ speaker: 'Mike', text: `Three things. One, check the soil moisture. Two, prune those lower branches for airflow. And three, prep a nutrient mix for tomorrow's feeding cycle.` })

        lines.push({ speaker: 'Sarah', text: `Crystal clear. Thanks Mike, and happy growing everyone!` })

        return lines
    }, [activeProfile, system])

    return { script }
}
