'use client'

import React from 'react'
import Link from 'next/link'
import { Leaf, ArrowRight, Activity, Sparkles, Shield, Zap, BarChart3, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function LandingPage() {
    const { user } = useAuth()

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="flex items-center justify-between p-6 max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 animate-fade-in">
                        <div className="w-10 h-10 bg-apeel-green rounded-xl flex items-center justify-center shadow-lg">
                            <Leaf className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-apeel-black">LeafScan AI</span>
                    </div>
                    <div className="flex items-center gap-4 animate-fade-in-down">
                        {user ? (
                            <Link href="/dashboard" className="btn-primary">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/login" className="btn-ghost">
                                    Sign In
                                </Link>
                                <Link href="/auth/signup" className="btn-primary">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in-up">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 font-semibold text-sm">
                            <Sparkles className="w-4 h-4" />
                            Powered by Google Gemini AI
                        </div>

                        {/* Headline */}
                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight text-apeel-black">
                            Save Your Crops with
                            <span className="gradient-text block mt-2">AI-Powered Diagnosis</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                            Instant plant disease detection, organic treatment recommendations, and year-long crop monitoring. 
                            Built for farmers who care about their harvest.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Link href={user ? "/dashboard/scan" : "/auth/signup"} className="btn-primary text-lg">
                                Start Free Scan <ArrowRight className="w-5 h-5 inline ml-2" />
                            </Link>
                            <Link href={user ? "/dashboard" : "/auth/login"} className="btn-secondary text-lg">
                                {user ? "View Dashboard" : "Sign In"}
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-apeel-green">85%+</div>
                                <div className="text-sm text-gray-600 mt-1">Accuracy</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-apeel-green">&lt;10s</div>
                                <div className="text-sm text-gray-600 mt-1">Analysis Time</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-apeel-green">40%</div>
                                <div className="text-sm text-gray-600 mt-1">Loss Reduction</div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Visual */}
                    <div className="mt-20 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="card-elevated p-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Left: Upload Preview */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-apeel-green rounded-lg flex items-center justify-center">
                                            <Leaf className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-bold">Upload Leaf Image</div>
                                            <div className="text-sm text-gray-600">Instant AI Analysis</div>
                                        </div>
                                    </div>
                                    <div className="aspect-square bg-white rounded-xl border-2 border-dashed border-green-300 flex items-center justify-center">
                                        <div className="text-center text-gray-400">
                                            <Activity className="w-12 h-12 mx-auto mb-2" />
                                            <div className="text-sm">Drag & Drop</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Results Preview */}
                                <div className="space-y-4">
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            <span className="font-bold text-red-900">Disease Detected</span>
                                        </div>
                                        <div className="text-sm text-red-700">Early Blight - Confidence: 92%</div>
                                    </div>
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                        <div className="font-bold text-green-900 mb-2">Recommended Treatment</div>
                                        <div className="text-sm text-green-700">Organic neem oil spray - Apply every 7 days</div>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <div className="font-bold text-blue-900 mb-2">Nearest Supplier</div>
                                        <div className="text-sm text-blue-700">AgriStore Casablanca - 5.2 km away</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <section className="mt-32 max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 animate-fade-in-up">
                        <h2 className="text-4xl md:text-5xl font-bold text-apeel-black mb-4">
                            Everything You Need to Save Your Crops
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            From instant diagnosis to year-long monitoring, we&apos;ve got you covered
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="card hover-lift">
                            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                                <Sparkles className="w-7 h-7 text-apeel-green" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-apeel-black">AI-Powered Diagnosis</h3>
                            <p className="text-gray-600">
                                Advanced computer vision detects diseases with 85%+ accuracy in under 10 seconds. Get instant, actionable insights.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card hover-lift">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                                <Shield className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-apeel-black">Organic-First Solutions</h3>
                            <p className="text-gray-600">
                                Prioritize sustainable, eco-friendly treatments. Reduce chemical use by 30% while maintaining crop health.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card hover-lift">
                            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                                <BarChart3 className="w-7 h-7 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-apeel-black">Year-Long Tracking</h3>
                            <p className="text-gray-600">
                                Monitor crop health from seed to harvest. Track growth stages, vitals, and treatment progress over time.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="card hover-lift">
                            <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-4">
                                <Zap className="w-7 h-7 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-apeel-black">Instant Action Plans</h3>
                            <p className="text-gray-600">
                                Get step-by-step treatment plans with weather optimization, cost estimates, and supplier recommendations.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="card hover-lift">
                            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                                <Activity className="w-7 h-7 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-apeel-black">Real-Time Monitoring</h3>
                            <p className="text-gray-600">
                                Continuous crop vitals tracking with autonomous AI agents that adapt to changing conditions.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="card hover-lift">
                            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-apeel-black">Proven Results</h3>
                            <p className="text-gray-600">
                                Reduce crop losses by up to 40%. Join farmers worldwide who are saving their harvests with AI.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="mt-32 mb-20 max-w-5xl mx-auto px-6">
                    <div className="card-elevated text-center p-12 md:p-16 bg-gradient-to-br from-apeel-green to-emerald-700">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Ready to Save Your Crops?
                        </h2>
                        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                            Join thousands of farmers using AI to protect their harvests. Start your first scan for free today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={user ? "/dashboard/scan" : "/auth/signup"} className="px-8 py-4 bg-white text-apeel-green rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg">
                                Start Free Scan <ArrowRight className="w-5 h-5 inline ml-2" />
                            </Link>
                            <Link href={user ? "/dashboard" : "/auth/login"} className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all">
                                {user ? "View Dashboard" : "Sign In"}
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-apeel-green rounded-lg flex items-center justify-center">
                            <Leaf className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-apeel-black">LeafScan AI</span>
                    </div>
                    <p className="text-gray-600 mb-4">
                        AI-powered crop disease diagnosis and monitoring
                    </p>
                    <p className="text-sm text-gray-500">
                        © 2024 LeafScan AI. Built with ❤️ for sustainable agriculture.
                    </p>
                </div>
            </footer>
        </div>
    )
}
