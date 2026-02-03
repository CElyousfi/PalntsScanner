'use client'

import { useRef, useEffect } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'

// Animated Counter Component
function AnimatedCounter({ value, duration = 2.5 }: { value: number, duration?: number }) {
    const nodeRef = useRef<HTMLSpanElement>(null)
    const inView = useInView(nodeRef, { once: true, margin: "-10%" })

    useEffect(() => {
        if (!inView || !nodeRef.current) return

        const node = nodeRef.current
        const controls = animate(0, value, {
            duration,
            ease: [0.25, 0.1, 0.25, 1], // Cubic bezier for smooth "landing"
            onUpdate(v) {
                node.textContent = v.toLocaleString('en-US', {
                    maximumFractionDigits: v < 100 ? 1 : 0, // Show decimal for smaller numbers if needed
                    minimumFractionDigits: 0
                })
            }
        })

        return () => controls.stop()
    }, [value, inView, duration])

    return <span ref={nodeRef} />
}

export default function ImpactStats() {
    const { t, language } = useLanguage()
    const isRTL = language === 'ar'

    const stats = [
        {
            id: 1,
            value: 145.6,
            unit: t('stats.item1_unit'),
            label: t('stats.item1_label'),
        },
        {
            id: 2,
            value: 29.1,
            unit: t('stats.item2_unit'),
            label: t('stats.item2_label'),
        },
        {
            id: 3,
            value: 6.96,
            unit: t('stats.item3_unit'),
            label: t('stats.item3_label'),
        }
    ]

    return (
        <section className="relative h-screen min-h-[800px] flex flex-col justify-between overflow-hidden bg-black">
            {/* Background Image with Parallax Effect */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
                    style={{
                        backgroundImage: "url('/impact-bg.jpg')",
                    }}
                />
                {/* Subtle gradiant overlays for text readability only at top and bottom */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
            </div>

            {/* Top Section: Title */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 pt-32">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter leading-[0.9] max-w-4xl"
                >
                    {t('stats.title')}
                </motion.h2>
            </div>

            {/* Bottom Section: Disclaimer & Stats */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">

                    {/* Disclaimer (Left Column) */}
                    <div className="lg:col-span-3">
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="text-white/70 text-sm md:text-base font-medium leading-relaxed max-w-xs"
                        >
                            {t('stats.disclaimer')}
                        </motion.p>
                    </div>

                    {/* Stats (Right Columns) */}
                    <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15, duration: 0.8, ease: "easeOut" }}
                                className="group"
                            >
                                <div className="flex items-baseline mb-2">
                                    {/* Number + Unit grouped tightly */}
                                    <span className="text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter">
                                        <AnimatedCounter value={stat.value} />
                                        {stat.unit}
                                    </span>
                                </div>
                                <p className="text-base md:text-lg text-white/90 font-medium leading-snug border-l-2 border-apeel-green/50 pl-4 py-1">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    )
}
