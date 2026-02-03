import { NextResponse } from 'next/server'

export async function GET() {
    // Current time for reference
    const now = new Date();

    // Helper to generate recent timestamps
    const getTime = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60000).toISOString();

    const features = [
        // CRITICAL THREATS (Red)
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-7.6198, 33.5531] }, // Near Casablanca
            properties: {
                id: "evt-001",
                disease: "Late Blight Outbreak",
                crop: "Tomato",
                level: "critical",
                category: "Fungal",
                timestamp: getTime(15),
                details: "Rapid spread detected in greenhouse sector 4.",
                region: "Casablanca-Settat",
                affected_hectares: 12
            }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-9.23, 30.42] }, // Agadir
            properties: {
                id: "evt-002",
                disease: "Tomato Yellow Leaf Curl Virus",
                crop: "Tomato",
                level: "high",
                category: "Viral",
                timestamp: getTime(45),
                details: "Whitefly vector counting exceeding thresholds.",
                region: "Souss-Massa",
                affected_hectares: 45
            }
        },
        // MEDIUM THREATS (Orange/Yellow)
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-5.54, 33.89] }, // Meknes
            properties: {
                id: "evt-003",
                disease: "Powdery Mildew",
                crop: "Grape",
                level: "medium",
                category: "Fungal",
                timestamp: getTime(120),
                details: "Early warnings from spore traps.",
                region: "Fès-Meknès",
                affected_hectares: 5
            }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-7.5898, 33.5731] }, // Casablanca City
            properties: {
                id: "evt-004",
                disease: "Botrytis",
                crop: "Strawberry",
                level: "medium",
                category: "Fungal",
                timestamp: getTime(30),
                details: "Humidity spikes increasing risk.",
                region: "Casablanca",
                affected_hectares: 2
            }
        },
        // LOW/INFO (Green/Blue)
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-8.0, 31.6] }, // Marrakech
            properties: {
                id: "evt-005",
                disease: "Heat Stress Warning",
                crop: "General",
                level: "low",
                category: "Environmental",
                timestamp: getTime(240),
                details: "Temperatures expected to rise >35C.",
                region: "Marrakech-Safi",
                affected_hectares: 0
            }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-3.0, 35.1] }, // Nador
            properties: {
                id: "evt-006",
                disease: "Leaf Miner",
                crop: "Citrus",
                level: "low",
                category: "Pest",
                timestamp: getTime(360),
                details: "Isolated incidents reported.",
                region: "Oriental",
                affected_hectares: 1
            }
        },
        // CLUSTER DATA GENERATION (Simulated points around Agadir)
        ...Array.from({ length: 15 }).map((_, i) => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [-9.5 + (Math.random() * 0.5 - 0.25), 30.4 + (Math.random() * 0.5 - 0.25)]
            },
            properties: {
                id: `cluster-aga-${i}`,
                disease: "Tuta Absoluta",
                crop: "Tomato",
                level: Math.random() > 0.7 ? "high" : "medium",
                category: "Pest",
                timestamp: getTime(Math.floor(Math.random() * 1000)),
                details: "Pheromone trap counting active.",
                region: "Souss-Massa",
                affected_hectares: Math.floor(Math.random() * 10)
            }
        }))
    ];

    return NextResponse.json({
        type: "FeatureCollection",
        features: features
    })
}
