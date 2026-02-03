'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const slides = [
    {
        title: "Disease Identification",
        description: "Gain insights into your crop's health with our extensive database of pathogen signatures.\nFungal, bacterial, viral, and pest-induced damage detection...",
        link: "#diagnosis"
    },
    {
        title: "Yield Optimization",
        description: "Boost your harvest potential by addressing invisible stress factors early.\nNutrient deficiency, water stress, sunlight optimization, and more...",
        link: "#yield"
    },
    {
        title: "Soil Health",
        description: "Understand the root causes of plant distress with soil-correlations.\npH balance, microbiological activity, organic matter analysis...",
        link: "#soil"
    },
    {
        title: "Pest Control",
        description: "Targeted organic solutions for specific pest infestations.\nIntegrated Pest Management (IPM), biological controls, safety testing...",
        link: "#pest"
    }
]

export default function ApplicationsSlider() {
    return (
        <section className="py-24 bg-apeel-cream overflow-hidden">
            <div className="container mx-auto px-6 mb-12">
                <h2 className="text-6xl font-bold text-apeel-green">
                    APPLICATIONS.
                </h2>
            </div>

            <div className="flex overflow-x-auto snap-x snap-mandatory pb-12 px-6 gap-6 no-scrollbar">
                {slides.map((slide, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex-none w-[85vw] md:w-[500px] snap-center relative group overflow-hidden rounded-[2.5rem] bg-white shadow-lg border-2 border-transparent hover:border-apeel-green transition-all duration-300"
                    >
                        <div className="p-12 h-[450px] flex flex-col justify-between">
                            <div>
                                <h3 className="text-4xl font-bold text-apeel-green mb-6 leading-tight">
                                    {slide.title}
                                </h3>
                                <p className="text-lg text-black/70 leading-relaxed whitespace-pre-line">
                                    {slide.description}
                                </p>
                            </div>

                            <a href={slide.link} className="inline-flex items-center space-x-2 text-apeel-green font-bold tracking-widest uppercase hover:underline decoration-2 underline-offset-4">
                                <span>LEARN MORE</span>
                                <ArrowRight size={20} />
                            </a>
                        </div>
                        {/* Decorative organic blob */}
                        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-apeel-green/5 rounded-full blur-2xl group-hover:bg-apeel-accent/20 transition-colors duration-500" />
                    </motion.div>
                ))}
                {/* Spacer for end of scroll */}
                <div className="flex-none w-12" />
            </div>
        </section>
    )
}
