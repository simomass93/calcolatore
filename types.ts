export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Warehouse {
  name: string;
  location: Coordinates;
}

export interface DistanceResult {
  warehouse: Warehouse;
  distance: number;
}

export interface PricingTier {
  quantity: number;
  dailyRate: number;
}

export interface Totem {
  id: string;
  name: string;
  pricingTiers: PricingTier[];
}

export interface TransportOption {
    name: string;
    transportCost: number | 'A Preventivo';
    totalCost: number | 'A Preventivo';
    details: string;
    // Nuovi campi per costo per singolo totem (cad)
    transportCostPerUnit?: number | 'A Preventivo';
    totalCostPerUnit?: number | 'A Preventivo';
}

export interface QuoteDetails {
    totem: Totem;
    quantity: number;
    days: number;
    destinationCity: string;
    rentalCost: number;
    rentalCostPerUnit?: number;
    transportOptions: TransportOption[];
    distance: number;
    closestWarehouse: Warehouse;
}