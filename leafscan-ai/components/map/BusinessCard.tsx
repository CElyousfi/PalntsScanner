import { Phone, MapPin, Star, Navigation, Globe } from 'lucide-react'

interface BusinessCardProps {
    data: {
        name: string
        category: string
        address: string
        phone: string
        website?: string
        rating: number
        reviews: number
        distance: number
        isOpen: boolean
    }
}

export default function BusinessCard({ data }: BusinessCardProps) {
    return (
        <div className="w-64 bg-white rounded-xl shadow-xl overflow-hidden font-urbanist border border-stone-200">
            {/* Header */}
            <div className="bg-[#EAE8D9] p-3 flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-stone-900 text-sm leading-tight">{data.name}</h3>
                    <p className="text-[10px] uppercase font-bold text-stone-500 tracking-wider mt-1">{data.category}</p>
                </div>
                <div className="flex items-center gap-1 bg-white/50 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-stone-700">{data.rating}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-3">

                {/* Status */}
                <div className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${data.isOpen ? 'bg-emerald-500' : 'bg-red-400'}`} />
                    <span className="font-medium text-stone-600">{data.isOpen ? 'Open Now' : 'Closed'}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-stone-500">{data.distance} km away</span>
                </div>

                {/* Details */}
                <div className="space-y-2">
                    <div className="flex items-start gap-2 text-xs text-stone-600">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 text-stone-400" />
                        <span className="leading-snug">{data.address}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                    <a href={`tel:${data.phone}`} className="flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 py-1.5 rounded-lg text-xs font-bold transition-colors">
                        <Phone className="w-3 h-3" />
                        Call
                    </a>
                    <button className="flex items-center justify-center gap-1.5 bg-apeel-green hover:bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
                        <Navigation className="w-3 h-3" />
                        Go
                    </button>
                </div>
            </div>
        </div>
    )
}
