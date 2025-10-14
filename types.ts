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
}

export interface QuoteDetails {
    totem: Totem;
    quantity: number;
    days: number;
    destinationCity: string;
    rentalCost: number;
    transportOptions: TransportOption[];
    distance: number;
    closestWarehouse: Warehouse;
}