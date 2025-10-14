import type { Warehouse } from './types';

export const WAREHOUSES: Warehouse[] = [
  {
    name: "Roma",
    location: { lat: 41.9028, lon: 12.4964 },
  },
  {
    name: "Novi Ligure",
    location: { lat: 44.7571, lon: 8.7858 },
  },
];

export const KM_COST = 1; // 1€ per km

// Tariffe fisse per Trasporto Dedicato (chiavi in lowercase)
export const FIXED_DEDICATED_TRANSPORT: { [cityKey: string]: number } = {
  roma: 300,
  milano: 500,
};