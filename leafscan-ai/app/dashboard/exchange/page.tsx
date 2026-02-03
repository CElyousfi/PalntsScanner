'use client'

import React, { useState } from 'react'
import { ArrowLeft, Gift, MapPin, Search, Leaf, Heart, Plus, CheckCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useExchange, Listing } from '@/context/ExchangeContext'

export default function HarvestExchangePage() {
    const router = useRouter()
    const { listings, addListing, claimListing, isLoading } = useExchange()
    const [filter, setFilter] = useState<'all' | 'donation' | 'request'>('all')

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newItem, setNewItem] = useState({ item: '', qty: '', description: '', type: 'donation' as const })

    const activeListings = listings.filter(l => l.status === 'available' && (filter === 'all' || l.type === filter))

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        addListing(newItem)
        setIsModalOpen(false)
        setNewItem({ item: '', qty: '', description: '', type: 'donation' })
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in p-6 pb-24">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-400" />
                </button>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Harvest Exchange 🤝</h1>
                    <p className="text-gray-500">Connect, share, and fight local hunger.</p>
                </div>
            </div>

            {/* Hero Card */}
            <div className="bg-gradient-to-r from-orange-400 to-rose-500 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-4 border border-white/10">
                        COMMUNITY IMPACT
                    </span>
                    <h2 className="text-4xl font-serif font-bold mb-4 leading-tight">
                        Turn your surplus into someone&apos;s meal.
                    </h2>
                    <p className="text-white/90 text-lg mb-8 max-w-lg">
                        Last month, LeafScan users donated over <strong>450kg</strong> of fresh produce to local food banks. Join the movement.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <Gift className="w-5 h-5" /> List Donation
                        </button>
                        <button className="bg-white/10 text-white border border-white/30 px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors">
                            Find Local Banks
                        </button>
                    </div>
                </div>
                <Heart className="absolute -bottom-10 -right-10 w-80 h-80 text-white/20 rotate-12" />
            </div>

            {/* Listings Grid */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-400" /> Nearby Listings
                    </h3>
                    <div className="flex gap-2">
                        {(['all', 'donation', 'request'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${filter === f ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                {f}s
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {activeListings.length === 0 ? (
                        <div className="col-span-3 text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                            <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No active listings in your area yet.</p>
                            <button onClick={() => setIsModalOpen(true)} className="text-orange-600 font-bold text-sm mt-2 hover:underline">
                                Be the first to donate!
                            </button>
                        </div>
                    ) : (
                        activeListings.map((listing) => (
                            <ListingCard key={listing.id} listing={listing} onClaim={() => claimListing(listing.id, 'Me')} />
                        ))
                    )}
                </div>
            </div>

            {/* Add Listing Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                                <Plus className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900">New Listing</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">What are you listing?</label>
                                <input
                                    required
                                    value={newItem.item}
                                    onChange={e => setNewItem({ ...newItem, item: e.target.value })}
                                    placeholder="e.g. Extra Cucumbers"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500/20 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Quantity</label>
                                    <input
                                        required
                                        value={newItem.qty}
                                        onChange={e => setNewItem({ ...newItem, qty: e.target.value })}
                                        placeholder="e.g. 3kg"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Type</label>
                                    <select
                                        value={newItem.type}
                                        onChange={e => setNewItem({ ...newItem, type: e.target.value as any })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500/20 outline-none"
                                    >
                                        <option value="donation">Donation (Free)</option>
                                        <option value="request">Request (Need)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Description (Optional)</label>
                                <textarea
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    placeholder="Pickup details, condition, etc."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500/20 outline-none h-24 resize-none"
                                />
                            </div>

                            <button type="submit" className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200 mt-2">
                                Post Listing
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

function ListingCard({ listing, onClaim }: { listing: Listing, onClaim: () => void }) {
    return (
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between group cursor-pointer hover:border-orange-200 hover:shadow-lg transition-all h-full">
            <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${listing.type === 'donation' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                    <Leaf className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{listing.item}</h4>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{listing.description || 'No description provided.'}</p>
                </div>
            </div>

            <div className="mt-auto border-t border-gray-50 pt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                    <span className="font-bold text-gray-900">{listing.qty}</span> • {listing.dist} • {listing.time}
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onClaim() }}
                    className="text-xs font-bold text-apeel-green bg-green-50 px-3 py-1.5 rounded-lg hover:bg-apeel-green hover:text-white transition-all"
                >
                    Claim
                </button>
            </div>
        </div>
    )
}
