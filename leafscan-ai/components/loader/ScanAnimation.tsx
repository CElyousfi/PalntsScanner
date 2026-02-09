
import { motion } from 'framer-motion'
import { Leaf, Apple, Sparkles } from 'lucide-react'

interface ScanAnimationProps {
    mode: 'leaf' | 'crop'
    size?: number
    className?: string
}

export default function ScanAnimation({ mode, size = 160, className = "" }: ScanAnimationProps) {
    const Icon = mode === 'leaf' ? Leaf : Apple
    const color = mode === 'leaf' ? '#22c55e' : '#ef4444' // green-500 : red-500 (but maybe apple should be red or green? usually apple crops are red/green. Let's stick to the app's theme which seems to be apeel-green. Let's use inherit or specific colors)

    // Actually, looking at the app, 'apeel-green' is key. Let's use that for leaf.
    // For crop (apple), maybe a slightly different hue or just keep consistent?
    // The previous code had "text-apeel-green" for both icons in the header. I'll stick to a green theme generally, maybe slightly different for apple if needed, but uniformity is good.
    // Actually, let's make the apple icon a bit distinct but still harmonious. Maybe a warm green or just standard.

    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>

            {/* Outer Pulse Rings */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border border-apeel-green/20"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: [0, 0.5, 0],
                        scale: [0.8, 1.4, 1.6],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 3,
                        delay: i * 0.8,
                        ease: "easeOut"
                    }}
                />
            ))}

            {/* Rotating Dashed Ring */}
            <motion.div
                className="absolute inset-4 rounded-full border-2 border-dashed border-apeel-green/30"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            />

            {/* Counter-Rotating Ring */}
            <motion.div
                className="absolute inset-8 rounded-full border border-apeel-green/10"
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-apeel-green/40 rounded-full blur-[1px]" />
            </motion.div>

            {/* Central Icon Container */}
            <div className="relative z-10 p-6 bg-white/50 backdrop-blur-sm rounded-3xl shadow-lg border border-white/40">
                <Icon
                    size={size * 0.4}
                    className="text-apeel-green drop-shadow-lg"
                    strokeWidth={1.5}
                />

                {/* Masked Fill / Scan Effect within the icon could be complex. 
                    Instead, let's do a scanning beam OVER the icon. */}

                <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-apeel-green/20 to-transparent z-20"
                    initial={{ top: '-100%' }}
                    animate={{ top: '200%' }}
                    transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear",
                        repeatDelay: 0.5
                    }}
                    style={{ clipPath: 'inset(0 0 0 0)' }} // simple clipping
                />
            </div>

            {/* Scanning Beam (Horizontal Line) */}
            <motion.div
                className="absolute left-0 right-0 h-0.5 bg-apeel-green/60 shadow-[0_0_15px_rgba(34,197,94,0.6)] z-30"
                initial={{ top: '10%' }}
                animate={{ top: '90%' }}
                transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                    repeatType: "reverse"
                }}
            >
                {/* Particles on the beam */}
                <motion.div
                    className="absolute right-10 -top-1 w-2 h-2 bg-white rounded-full shadow-sm"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                />
            </motion.div>

            {/* Tech Decoration Dots */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-apeel-green/50 rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-apeel-green/50 rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-apeel-green/50 rounded-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-apeel-green/50 rounded-full" />

        </div>
    )
}
