'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Github, Twitter, Linkedin } from 'lucide-react'

interface MenuOverlayProps {
    isOpen: boolean
    onClose: () => void
}

const menuItems = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Start Scan', href: '/dashboard/scan' },
    { title: 'History', href: '/dashboard/history' },
    { title: 'Process', href: '#process' },
]

export default function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex flex-col md:flex-row"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-apeel-black/50 backdrop-blur-sm z-0"></div>

                    {/* Left Panel - Navigation */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="relative z-10 w-full md:w-2/3 h-full bg-apeel-green text-apeel-cream border-r border-apeel-cream/10 p-8 md:p-20 flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-center md:hidden">
                            <span className="font-bold text-xl tracking-tight">MENU</span>
                            <button onClick={onClose} className="p-2 hover:text-white transition-colors">
                                <X size={32} />
                            </button>
                        </div>

                        <nav className="flex flex-col space-y-2 mt-12 md:mt-0">
                            {menuItems.map((item, index) => (
                                <motion.a
                                    key={item.title}
                                    href={item.href}
                                    onClick={onClose}
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 + (index * 0.1) }}
                                    className="group flex items-center justify-between text-4xl md:text-7xl font-bold text-apeel-cream/50 hover:text-apeel-cream transition-colors py-4 border-b border-apeel-cream/10 hover:border-white/50"
                                >
                                    <span className="group-hover:translate-x-4 transition-transform duration-300">
                                        {item.title}
                                    </span>
                                    <ArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-10 group-hover:translate-x-0 transition-all duration-300 text-white w-12 h-12" />
                                </motion.a>
                            ))}
                        </nav>

                        <div className="hidden md:flex space-x-6 text-apeel-cream/60 font-medium tracking-wide">
                            <a href="#" className="hover:text-white transition-colors">GITHUB</a>
                            <a href="#" className="hover:text-white transition-colors">DOCS</a>
                            <a href="#" className="hover:text-white transition-colors">API</a>
                        </div>
                    </motion.div>

                    {/* Right Panel - Info / Close */}
                    <motion.div
                        initial={{ y: '-100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={{ type: "spring", damping: 30, stiffness: 300, delay: 0.1 }}
                        className="relative z-10 w-full md:w-1/3 h-full bg-apeel-cream flex flex-col p-8 md:p-20"
                    >
                        <div className="hidden md:flex justify-end mb-12">
                            <button
                                onClick={onClose}
                                className="group bg-transparent border border-apeel-green text-apeel-green rounded-full px-6 py-3 flex items-center space-x-2 hover:bg-apeel-green hover:text-white transition-all duration-300"
                            >
                                <span className="text-sm font-bold tracking-widest">CLOSE</span>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-auto">
                            <h3 className="text-apeel-green font-bold text-xl mb-4 tracking-tighter">[ GET IN TOUCH ]</h3>
                            <p className="text-apeel-black/80 mb-8 text-lg leading-relaxed">
                                Interested in integrating LeafScan technology into your agricultural workflow?
                            </p>
                            <a href="mailto:hello@leafscan.ai" className="text-3xl font-bold text-apeel-green hover:text-black transition-colors underline decoration-apeel-green/30 underline-offset-8">
                                hello@leafscan.ai
                            </a>

                            <div className="flex space-x-4 mt-12">
                                <div className="p-3 border border-apeel-green/20 rounded-full text-apeel-green hover:bg-apeel-green hover:text-white transition-all cursor-pointer">
                                    <Github size={20} />
                                </div>
                                <div className="p-3 border border-apeel-green/20 rounded-full text-apeel-green hover:bg-apeel-green hover:text-white transition-all cursor-pointer">
                                    <Twitter size={20} />
                                </div>
                                <div className="p-3 border border-apeel-green/20 rounded-full text-apeel-green hover:bg-apeel-green hover:text-white transition-all cursor-pointer">
                                    <Linkedin size={20} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
