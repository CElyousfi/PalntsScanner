'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Leaf, ArrowRight, Shield, Globe } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const { login, isLoading } = useAuth()
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        try {
            login(formData.email, formData.password)
        } catch (err: any) {
            setError(err.message)
        }
    }

    if (isLoading) return null

    return (
        <div className="min-h-screen bg-apeel-cream flex flex-col md:flex-row">
            {/* Visual Side */}
            <div className="w-full md:w-1/2 bg-apeel-black text-white p-12 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-apeel-green/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <Leaf className="w-8 h-8 text-apeel-green" />
                        <span className="font-serif text-2xl font-bold">LeafScan Pro</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                        Autonomous Crop Guardians.
                    </h1>
                    <p className="text-lg text-white/60 max-w-md">
                        Log in to manage your active horizons and check autonomous event logs.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-12 relative z-10">
                    <div className="flex gap-4">
                        <Shield className="w-8 h-8 text-apeel-green" />
                        <div>
                            <div className="font-bold text-lg">Secure</div>
                            <div className="text-white/60 text-sm">Encrypted session storage.</div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Globe className="w-8 h-8 text-blue-400" />
                        <div>
                            <div className="font-bold text-lg">Global</div>
                            <div className="text-white/60 text-sm">Monitoring 3 regions.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Form Side */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white">
                <div className="max-w-md w-full space-y-8 animate-fade-in-up">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-apeel-black mb-2">Welcome Back</h2>
                        <p className="text-gray-500">Sign in to your autonomous dashboard.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
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

                        <button
                            type="submit"
                            className="w-full bg-apeel-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 group"
                        >
                            Access Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="text-center pt-4 border-t border-gray-100">
                        <p className="text-gray-500">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-apeel-green font-bold hover:underline">
                                Create One
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
