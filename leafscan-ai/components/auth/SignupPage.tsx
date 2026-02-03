'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Leaf, ArrowRight, Shield, Globe } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
    const { signup } = useAuth()
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        region: 'Casablanca, Morocco'
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        try {
            signup(formData.name, formData.email, formData.region)
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <div className="min-h-screen bg-apeel-cream flex flex-col md:flex-row">
            {/* Visual Side (Shared) */}
            <div className="w-full md:w-1/2 bg-apeel-green text-white p-12 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <Leaf className="w-8 h-8" />
                        <span className="font-serif text-2xl font-bold">LeafScan Pro</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                        See Tomorrow.
                    </h1>
                    <p className="text-lg text-white/80 max-w-md">
                        Join the network of autonomous farms. Predict risks, optimize yields, and sleep better.
                    </p>
                </div>

                <div className="mt-12 opacity-80">
                    <p className="text-sm font-bold uppercase tracking-widest mb-2">New in V2</p>
                    <ul className="space-y-2">
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white rounded-full" /> Persistent &quot;Brain&quot; Memory</li>
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white rounded-full" /> Auto-Event Simulation</li>
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white rounded-full" /> Dynamic Coaching</li>
                    </ul>
                </div>
            </div>

            {/* Signup Form Side */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white">
                <div className="max-w-md w-full space-y-8 animate-fade-in-up">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-apeel-black mb-2">Create Account</h2>
                        <p className="text-gray-500">Start your autonomous journey today.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name / Farm Name</label>
                            <input
                                required
                                type="text"
                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-apeel-green focus:ring-2 focus:ring-apeel-green/20 outline-none transition-all"
                                placeholder="e.g. Atlas Orchards"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                required
                                type="email"
                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-apeel-green focus:ring-2 focus:ring-apeel-green/20 outline-none transition-all"
                                placeholder="name@farm.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input
                                required
                                type="password"
                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-apeel-green focus:ring-2 focus:ring-apeel-green/20 outline-none transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                            <select
                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-apeel-green focus:ring-2 focus:ring-apeel-green/20 outline-none transition-all bg-white"
                                value={formData.region}
                                onChange={e => setFormData({ ...formData, region: e.target.value })}
                            >
                                <option>Casablanca, Morocco</option>
                                <option>California, USA</option>
                                <option>Nairobi, Kenya</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-apeel-green text-white py-4 rounded-xl font-bold text-lg hover:bg-[#203a28] transition-colors flex items-center justify-center gap-2 group"
                        >
                            Launch System <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="text-center pt-4 border-t border-gray-100">
                        <p className="text-gray-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-apeel-green font-bold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
