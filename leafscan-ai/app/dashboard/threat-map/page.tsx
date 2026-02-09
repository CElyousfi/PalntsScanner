import SmartMap from '@/components/map/SmartMap'
import PageShell from '@/components/dashboard/PageShell'
import { Map } from 'lucide-react'

export default function ThreatMapPage() {
    return (
        <PageShell
            title="Threat Map"
        >
            <div className="animate-fade-in -mx-6 -mb-6" style={{ height: 'calc(100vh - 180px)' }}>
                <SmartMap />
            </div>
        </PageShell>
    )
}
