import { getRegionForCity } from './geminiService';
import { REGION_TO_AREA_MAP, BORGHI_PRICING, getBorghiPriceTier } from '../constants/borghiConstants';

interface BorghiResult {
    cost: number | 'A Preventivo';
    details: string;
}

/**
 * Calcolo del costo di trasporto tramite Corriere Borghi:
 * - Prende la tariffa dalla tabella per l'area e la fascia corretta (es. '2-4').
 * - Se la tariffa è numerica, il costo totale è: tariffa * quantity * 2 (andata/ritorno).
 * - Se la tariffa è 'A Preventivo' viene restituito 'A Preventivo'.
 */
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

        const tierPrice = areaPricing[priceTierKey];

        if (typeof tierPrice !== 'number') {
            // 'A Preventivo' o valore non numerico -> manteniamo lo stato 'A Preventivo'
            return {
                cost: 'A Preventivo',
                details: `Area: ${area} / N. Totem: ${totalTotems} / Tariffa: ${tierPrice}`
            };
        }

        // Formula richiesta: tariffa_per_fascia * quantity * 2 (andata/ritorno)
        const finalCost = tierPrice * totalTotems * 2;

        return {
            cost: finalCost,
            details: `Area: ${area} / Fascia: ${priceTierKey} / Tariffa per unità: €${tierPrice} → (€${tierPrice} x ${totalTotems} x 2 A/R) = €${finalCost}`
        };

    } catch (error) {
        console.error("Errore nel calcolo del costo Borghi:", error);
        return {
            cost: 'A Preventivo',
            details: 'Errore nel calcolo. Verificare la città.'
        };
    }
};