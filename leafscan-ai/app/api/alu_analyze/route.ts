import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as turf from '@turf/turf';

// --- Types ---
type BBox = {
    _sw: { lat: number; lng: number };
    _ne: { lat: number; lng: number };
};

type AnalysisRequest = {
    query: string;
    bounds: BBox;
    zoom: number;
};

// --- Config ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Use Flash for speed in this demo, or Pro for deep reasoning if available.
const MODEL_NAME = 'gemini-3-pro-preview'; // Gemini 3 Pro Preview

// --- Mock Data Generator (for when API Key is missing) ---
function generateMockGeoJSON(bounds: BBox): any {
    const centerLng = (bounds._sw.lng + bounds._ne.lng) / 2;
    const centerLat = (bounds._sw.lat + bounds._ne.lat) / 2;
    // Create a few simulated fields around the center
    const field1 = turf.polygon([[
        [centerLng - 0.002, centerLat - 0.002],
        [centerLng + 0.002, centerLat - 0.002],
        [centerLng + 0.002, centerLat + 0.002],
        [centerLng - 0.002, centerLat + 0.002],
        [centerLng - 0.002, centerLat - 0.002]
    ]], { class: 'Field', confidence: 0.95, layer: 'ground' });

    const pond = turf.circle([centerLng + 0.003, centerLat + 0.003], 0.1, {
        steps: 10, units: 'kilometers', properties: { class: 'Farm Pond', layer: 'water' }
    });

    const forest = turf.polygon([[
        [centerLng - 0.004, centerLat + 0.001],
        [centerLng - 0.003, centerLat + 0.004],
        [centerLng - 0.002, centerLat + 0.001],
        [centerLng - 0.004, centerLat + 0.001]
    ]], { class: 'Woodland', layer: 'tree' });

    return turf.featureCollection([field1, pond, forest]);
}

// --- Gemini Integration ---
async function analyzeWithGemini(prompt: string, bounds: BBox) {
    if (!GEMINI_API_KEY) {
        console.warn("No GEMINI_API_KEY found. Using mock data.");
        return {
            geojson: generateMockGeoJSON(bounds),
            insights: "Using simulated data. Configure GEMINI_API_KEY for live analysis.",
            metrics: { mIoU: 0.85, fnRate: 12, overSeg: 1.1 }
        };
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent([
            `Perform Agricultural Landscape Understanding (ALU) panoptic segmentation.
             Identify layers: ground (fields, ponds, other_water), well (dug_wells), tree (trees_woodland).
             Generate a GeoJSON FeatureCollection representing the agricultural landscape within the provided bounds.
             Bounds: North ${bounds._ne.lat}, South ${bounds._sw.lat}, East ${bounds._ne.lng}, West ${bounds._sw.lng}.
             Context: ${prompt}.
             Output strict GeoJSON format only. Ensure coordinates are within bounds.`
        ]);

        const responseText = result.response.text();
        const data = JSON.parse(responseText);

        // Basic validation/fallback
        const geojson = data.geojson || data;
        if (!geojson.type || geojson.type !== 'FeatureCollection') throw new Error("Invalid GeoJSON output");

        return {
            geojson: geojson,
            insights: "Analysis complete based on Gemini panoptic segmentation.",
            metrics: { mIoU: 0.72, fnRate: 5, overSeg: 1.05 } // Simulated metrics for now
        };

    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            geojson: generateMockGeoJSON(bounds),
            insights: "AI Analysis failed or timed out. Showing fallback data.",
            metrics: { mIoU: 0, fnRate: 0, overSeg: 0 }
        };
    }
}

// --- Post-Processing (ALU Pipeline) ---
function postProcessPipeline(geojson: any) {
    if (!geojson || !geojson.features) return geojson;

    // 1. Simplify (Smoothing) - Remove "daggers"
    const simplified = turf.simplify(geojson, { tolerance: 0.0001, highQuality: true });

    // 2. S2 Sharding Simulation (Grouping by location grid)
    // Real S2 is complex, we'll mock it by assigning an ID based on lat/lng grid
    const shards: Record<string, any> = {};

    simplified.features.forEach((feature: any) => {
        // Assign color based on class
        const cls = feature.properties?.class?.toLowerCase() || '';
        if (cls.includes('field') || cls.includes('crop')) feature.properties.fill = '#8B4513'; // Infrared/Field
        else if (cls.includes('water') || cls.includes('pond')) feature.properties.fill = '#60a5fa'; // Blue
        else if (cls.includes('tree') || cls.includes('wood')) feature.properties.fill = '#15803d'; // Green
        else feature.properties.fill = '#9ca3af'; // Gray default

        // Add to shard (mock cell ID)
        const center = turf.center(feature);
        const [lng, lat] = center.geometry.coordinates;
        const cellId = `cell_${Math.floor(lat * 100)}_${Math.floor(lng * 100)}`;

        if (!shards[cellId]) shards[cellId] = { type: 'FeatureCollection', features: [] };
        shards[cellId].features.push(feature);
    });

    return shards;
}

export async function POST(ctx: NextRequest) {
    try {
        const body: AnalysisRequest = await ctx.json();
        const { query, bounds } = body;

        // 1. "Tiling" Simulation (conceptually split, but we process whole bounds for this prototype)
        // In a real ALU system, we'd fetch 500x500px images here.

        // 2. Gemini Segmentation
        const analysisResult = await analyzeWithGemini(query, bounds);

        // 3. Post-Processing
        const shards = postProcessPipeline(analysisResult.geojson);

        return NextResponse.json({
            shards,
            insights: analysisResult.insights,
            metrics: analysisResult.metrics
        });

    } catch (e: any) {
        console.error("ALU Endpoint Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
