
export interface FarmHistoryEntry {
    date: string; // ISO string
    disease: string;
    infectionRate: number; // 0-100
    sustainability: number; // 0-100
    savedKg: number;
    savedMoney: number;
    actionTaken?: string;
}

export interface FarmSession {
    id: string;
    crop: string;
    startDate: string; // ISO string
    lastUpdate: string; // ISO string
    location: string;
    history: FarmHistoryEntry[]; // ordered by date
    plan: any; // The full MonitoringPlan object
    status: 'active' | 'completed';
}

export const STORAGE_KEY = 'leafscan-farm-session';

// Helper to initialize a new session from a diagnosis
export function createSessionFromDiagnosis(diagnosis: any, plan: any, location: string = 'Unknown'): FarmSession {
    const start = new Date().toISOString();

    // Initial Infection Rate based on severity
    const severity = diagnosis.severity?.toLowerCase() || 'medium';
    let initialInfection = 50;
    if (severity === 'high') initialInfection = 85;
    if (severity === 'low') initialInfection = 25;

    return {
        id: crypto.randomUUID(),
        crop: diagnosis.plantName || plan.cropType || 'Crop',
        startDate: start,
        lastUpdate: start,
        location,
        plan,
        status: 'active',
        history: [{
            date: start,
            disease: diagnosis.diseases?.[0]?.name || 'Structural Damage',
            infectionRate: initialInfection,
            sustainability: 50, // Baseline
            savedKg: 0,
            savedMoney: 0,
            actionTaken: 'Initial Diagnosis'
        }]
    };
}

// Calculations
export function calculateDaysPassed(startDate: string): number {
    const start = new Date(startDate).getTime();
    const now = new Date().getTime();
    const diff = now - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function calculateEconomicImpact(history: FarmHistoryEntry[]) {
    // Cumulative or based on latest?
    // Let's use latest state vs baseline
    if (history.length === 0) return { savedKg: 0, savedMoney: 0 };

    const latest = history[history.length - 1];
    const baseline = history[0];

    // Simple model: Each % drop in infection saves potential yield
    const infectionDrop = Math.max(0, baseline.infectionRate - latest.infectionRate);

    // Assumptions
    const PLANTS = 200;
    const YIELD_PER_PLANT = 5; // kg
    const PRICE_PER_KG = 1.2; // MAD

    // e.g. 50% drop -> 50% of potential yield saved
    const savedKg = (infectionDrop / 100) * (PLANTS * YIELD_PER_PLANT);
    const savedMoney = savedKg * PRICE_PER_KG;

    return {
        savedKg: Math.round(savedKg),
        savedMoney: Math.round(savedMoney)
    };
}
