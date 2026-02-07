
const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_KEY;

if (!GOOGLE_MAPS_KEY) {
    console.error("Please provide GOOGLE_MAPS_KEY env var");
    process.exit(1);
}

async function search(query, lat, lng) {
    console.log(`\n--- Searching for: "${query}" ---`);
    const endpoint = 'https://places.googleapis.com/v1/places:searchText';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating'
            },
            body: JSON.stringify({
                textQuery: query,
                locationBias: {
                    circle: {
                        center: { latitude: lat, longitude: lng },
                        radius: 10000
                    }
                },
                maxResultCount: 5
            })
        });

        if (!response.ok) {
            console.error(await response.text());
            return;
        }

        const data = await response.json();

        if (!data.places) {
            console.log("No places found.");
            return;
        }

        data.places.forEach((p, i) => {
            console.log(`\n[${i}] ${p.displayName.text}`);
            console.log(`    Types: ${p.types?.join(', ')}`);
            console.log(`    Address: ${p.formattedAddress}`);
        });

    } catch (e) {
        console.error(e);
    }
}

// User Location (Casablanca approx from SmartMap default)
const LAT = 33.5731;
const LNG = -7.5898;

async function run() {
    // 1. The query that likely failed
    await search("Potassium Bicarbonate Fungicide store", LAT, LNG);

    // 2. A broader query
    await search("Agricultural Supply Store", LAT, LNG);
}

run();
