'use client'

import { motion } from 'framer-motion'
import { Server, Zap, FileText, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function ProcessGraph() {
    const { t } = useLanguage()

    const steps = [
        {
            id: 1,
            title: t('components.process.step1_title'),
            icon: FileText,
            desc: t('components.process.step1_desc')
        },
        {
            id: 2,
            title: t('components.process.step2_title'),
            icon: Server,
            desc: t('components.process.step2_desc')
        },
        {
            id: 3,
            title: t('components.process.step3_title'),
            icon: Zap,
            desc: t('components.process.step3_desc')
        },
    ]

    return (
        <div className="w-full py-20 relative overflow-hidden">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-apeel-green/20 -translate-y-1/2 hidden md:block" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2, duration: 0.5 }}
                        viewport={{ once: true }}
                        className="group relative"
                    >
                        {/* Node Point */}
                        <div className="w-4 h-4 bg-vivaltes-dark border-2 border-vivaltes-lime rounded-full mx-auto mb-8 relative z-20 group-hover:scale-150 transition-transform duration-300">
                            <div className="absolute inset-0 bg-vivaltes-lime opacity-50 rounded-full animate-ping group-hover:animate-none" />
                        </div>

                        {/* Card */}
                        <div className="bg-white/5 backdrop-blur-sm border border-vivaltes-secondary/20 p-8 rounded-2xl hover:bg-vivaltes-dark hover:border-vivaltes-lime transition-all duration-300 group-hover:-translate-y-2">
                            <div className="bg-vivaltes-secondary/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 text-vivaltes-lime group-hover:bg-vivaltes-lime group-hover:text-vivaltes-dark transition-colors duration-300">
                                <step.icon size={32} />
                            </div>

                            <h3 className="text-xl font-bold text-vivaltes-dark group-hover:text-vivaltes-bg mb-2 transition-colors">
                                {step.title}
                            </h3>

                            <p className="text-sm text-vivaltes-dark/60 group-hover:text-vivaltes-bg/80 transition-colors">
                                {step.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
