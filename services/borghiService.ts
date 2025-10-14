import { getRegionForCity } from './geminiService';
import { REGION_TO_AREA_MAP, BORGHI_PRICING, getBorghiPriceTier } from '../constants/borghiConstants';

interface BorghiResult {
    cost: number | 'A Preventivo';
    details: string;
}

export const calculateBorghiTransportCost = async (city: string, totalTotems: number): Promise<BorghiResult> => {
    // Special handling for Venice as per the price list
    if (city.toLowerCase().includes('venezia')) {
        const area = 'ISOLE MINORI';
        const cost = BORGHI_PRICING[area]['1']; // All tiers are "A Preventivo"
        return { cost, details: `Area Speciale (${area})` };
    }

    try {
        const region = await getRegionForCity(city);
        const area = REGION_TO_AREA_MAP[region];

        if (!area) {
            throw new Error(`Area non trovata per la regione: ${region}`);
        }

        const priceTierKey = getBorghiPriceTier(totalTotems);
        const areaPricing = BORGHI_PRICING[area];
        
        if (!areaPricing) {
             throw new Error(`Prezzi non disponibili per l'area: ${area}`);
        }

        const rawCost = areaPricing[priceTierKey];

        // If the cost is numeric, double it as requested; otherwise keep 'A Preventivo'.
        const finalCost = typeof rawCost === 'number' ? rawCost * 2 : 'A Preventivo';

        return {
            cost: finalCost,
            details: `Area: ${area} / N. Totem: ${totalTotems} A/R: ${typeof rawCost === 'number' ? `€${rawCost} -> €${finalCost}` : rawCost})`
        };

    } catch (error) {
        console.error("Errore nel calcolo del costo Borghi:", error);
        // Return a clear error state instead of crashing
        return {
            cost: 'A Preventivo',
            details: 'Errore nel calcolo. Verificare la città.'
        };
    }
};