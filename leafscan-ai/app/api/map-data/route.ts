import { NextResponse } from 'next/server'

export async function GET() {
    // In a real app, this would fetch from a database or external API
    // and filter by user location viewport

    // Mock Data for Casablanca Region
    const data = {
        userLocation: {
            lat: 33.5731,
            lng: -7.5898
        },
        suppliers: [
            {
                id: '1',
                name: "Bio-Agri Maroc",
                type: "Organic Certified",
                distance_km: 4.2,
                address: "Route de Bouskoura, Casablanca",
                tags: ["Organic", "Fertilizers", "Biocontrol"],
                rating: 4.8,
                hours: "08:00 - 18:00",
                location: { lat: 33.5531, lng: -7.6198 }
            },
            {
                id: '2',
                name: "AgroSolutions Oasis",
                type: "Equipment & Seeds",
                distance_km: 7.5,
                address: "Zone Industrielle Mohammedia",
                tags: ["Tools", "Irrigation"],
                rating: 4.5,
                hours: "09:00 - 19:00",
                location: { lat: 33.6931, lng: -7.3898 }
            },
            {
                id: '3',
                name: "GreenLeaf Supplies",
                type: "General Agriculture",
                distance_km: 1.8,
                address: "Maarif, Casablanca",
                tags: ["Pesticides", "Consulting"],
                rating: 4.2,
                hours: "08:30 - 20:00",
                location: { lat: 33.5831, lng: -7.6398 }
            },
            {
                id: '4',
                name: "EcoFermiers Coop",
                type: "Cooperatives",
                distance_km: 12.1,
                address: "Dar Bouazza",
                tags: ["Organic", "Bulk"],
                rating: 4.9,
                hours: "07:00 - 16:00",
                location: { lat: 33.5131, lng: -7.8098 }
            }
        ],
        hotspots: [
            // Disease hotspots for heatmaps
            { lat: 33.5631, lng: -7.6098, intensity: 0.8 },
            { lat: 33.5431, lng: -7.5598, intensity: 0.5 }
        ]
    }

    return NextResponse.json(data)
}
