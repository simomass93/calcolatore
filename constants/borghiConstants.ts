// Data extracted from the provided PDF document for Borghi shipping rates.

// Mapping Italian regions to the pricing areas defined by Borghi.
export const REGION_TO_AREA_MAP: { [key: string]: string } = {
    'Lombardia': 'LOMBARDIA',
    'Piemonte': 'NORD',
    'Valle d\'Aosta': 'NORD',
    'Liguria': 'NORD',
    'Veneto': 'NORD',
    'Friuli-Venezia Giulia': 'NORD',
    'Trentino-Alto Adige': 'NORD',
    'Emilia-Romagna': 'NORD',
    'Toscana': 'CENTRO',
    'Umbria': 'CENTRO',
    'Marche': 'CENTRO',
    'Lazio': 'LAZIO',
    'Abruzzo': 'CENTRO',
    'Molise': 'CENTRO',
    'Campania': 'SUD',
    'Puglia': 'SUD',
    'Basilicata': 'SUD',
    'Calabria': 'ISOLE_E_CALABRIA',
    'Sicilia': 'ISOLE_E_CALABRIA',
    'Sardegna': 'ISOLE_E_CALABRIA',
};

// Pricing table based on area and quantity of items (max 55kg each).
export const BORGHI_PRICING: { [key: string]: { [key: string]: number | 'A Preventivo' } } = {
    'LAZIO': {
        '1': 125,
        '2-4': 115,
        '5-7': 95,
        '8+': 85,
    },
    'CENTRO': {
        '1': 135,
        '2-4': 125,
        '5-7': 105,
        '8+': 95,
    },
    'LOMBARDIA': {
        '1': 140,
        '2-4': 130,
        '5-7': 110,
        '8+': 100,
    },
    'NORD': {
        '1': 155,
        '2-4': 145,
        '5-7': 125,
        '8+': 115,
    },
    'SUD': {
        '1': 180,
        '2-4': 170,
        '5-7': 160,
        '8+': 150,
    },
    'ISOLE_E_CALABRIA': {
        '1': 220,
        '2-4': 210,
        '5-7': 200,
        '8+': 190,
    },
    'ISOLE MINORI': { // Special cases like Venice are "A Preventivo"
        '1': 'A Preventivo',
        '2-4': 'A Preventivo',
        '5-7': 'A Preventivo',
        '8+': 'A Preventivo',
    },
};

// Function to determine the correct price tier based on quantity.
export const getBorghiPriceTier = (quantity: number): string => {
    if (quantity === 1) return '1';
    if (quantity >= 2 && quantity <= 4) return '2-4';
    if (quantity >= 5 && quantity <= 7) return '5-7';
    return '8+';
};
