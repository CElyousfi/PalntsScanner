import SmartMap from '@/components/map/SmartMap'
import PageShell from '@/components/dashboard/PageShell'
import { Map } from 'lucide-react'

export default function ThreatMapPage() {
    return (
        <PageShell
            title="Farm Analysis Map"
            badge={
                <div className="bg-[#EAE8D9] text-stone-800 text-xs px-3 py-1 rounded-full font-sans uppercase tracking-wider font-bold inline-flex items-center gap-1 shadow-sm border border-stone-300/50">
                    <Map className="w-3 h-3" />
                    Interactive Mapping
                </div>
            }
        >
            <div className="animate-fade-in -mx-6 -mb-6" style={{ height: 'calc(100vh - 180px)' }}>
                <SmartMap />
            </div>
        </PageShell>
    )
}
