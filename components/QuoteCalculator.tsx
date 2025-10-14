import React, { useState, useEffect } from 'react';
import type { Totem, QuoteDetails, TransportOption } from '../types';
import { findClosestWarehouse } from '../services/geoService';
import { calculateBorghiTransportCost } from '../services/borghiService';
import QuoteResult from './QuoteResult';
import { KM_COST, FIXED_DEDICATED_TRANSPORT } from '../constants';

interface QuoteCalculatorProps {
  totems: Totem[];
}

const QuoteCalculator: React.FC<QuoteCalculatorProps> = ({ totems }) => {
  const [selectedTotemId, setSelectedTotemId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [days, setDays] = useState<string>('1');
  const [destinationCity, setDestinationCity] = useState<string>('');
  
  const [quote, setQuote] = useState<QuoteDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set default totem selection
  useEffect(() => {
    if (totems.length > 0 && !selectedTotemId) {
      setSelectedTotemId(totems[0].id);
    }
  }, [totems, selectedTotemId]);

  const handleReset = () => {
    setQuote(null);
    setDestinationCity('');
    setQuantity('1');
    setDays('1');
    setError(null);
    if (totems.length > 0) {
        setSelectedTotemId(totems[0].id);
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTotemId || !quantity || !days || !destinationCity) {
      setError('Tutti i campi sono obbligatori.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const numQuantity = parseInt(quantity, 10);
      const numDays = parseInt(days, 10);
      const selectedTotem = totems.find(t => t.id === selectedTotemId);

      if (!selectedTotem || numQuantity <= 0 || numDays <= 0) {
        setError('Inserisci valori validi.');
        setIsLoading(false);
        return;
      }

      // 1. Calculate Rental Cost
      const applicableTier = [...selectedTotem.pricingTiers]
        .sort((a, b) => b.quantity - a.quantity)
        .find(tier => numQuantity >= tier.quantity);
      
      const dailyRate = applicableTier ? applicableTier.dailyRate : selectedTotem.pricingTiers[0]?.dailyRate || 0;
      const rentalCost = dailyRate * numQuantity * numDays;

      // 2. Get Distance and Closest Warehouse
      const { warehouse: closestWarehouse, distance } = await findClosestWarehouse(destinationCity);

      // 3. Calculate Transport Options
      const transportOptions: TransportOption[] = [];

      // Option A: Dedicated Transport (based on km) OR fixed for Roma/Milano
      const destNormalized = destinationCity.trim().toLowerCase();
      let dedicatedTransportCost: number;
      let dedicatedDetails = `Basato su ${distance} km da ${closestWarehouse.name} (A/R)`;

      if (destNormalized.includes('roma')) {
        dedicatedTransportCost = FIXED_DEDICATED_TRANSPORT['roma'];
        dedicatedDetails = `Tariffa fissa trasporto dedicato per Roma`;
      } else if (destNormalized.includes('milano')) {
        dedicatedTransportCost = FIXED_DEDICATED_TRANSPORT['milano'];
        dedicatedDetails = `Tariffa fissa trasporto dedicato per Milano`;
      } else {
        dedicatedTransportCost = distance > 0 ? distance * 2 * KM_COST : 0;
      }

      transportOptions.push({
          name: 'Trasporto Dedicato',
          transportCost: dedicatedTransportCost,
          totalCost: rentalCost + dedicatedTransportCost,
          details: dedicatedDetails
      });

      // Option B: Borghi Courier
      const borghiResult = await calculateBorghiTransportCost(destinationCity, numQuantity);
      
      const totalCostBorghi = typeof borghiResult.cost === 'number'
        ? rentalCost + borghiResult.cost
        : 'A Preventivo';
      
      transportOptions.push({
          name: 'Corriere Borghi (Consigliato)',
          transportCost: borghiResult.cost,
          totalCost: totalCostBorghi,
          details: borghiResult.details
      });


      // 4. Assemble Quote
      const quoteDetails: QuoteDetails = {
        totem: selectedTotem,
        quantity: numQuantity,
        days: numDays,
        destinationCity,
        rentalCost,
        transportOptions,
        distance,
        closestWarehouse,
      };

      setQuote(quoteDetails);

    } catch (err: any) {
      setError(err.message || 'Si è verificato un errore imprevisto.');
    } finally {
      setIsLoading(false);
    }
  };

  if (quote) {
    return <QuoteResult quote={quote} onReset={handleReset} />;
  }

  return (
    <div className="bg-white p-6 rounded-b-xl rounded-tr-xl shadow-lg">
      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Totem Model */}
          <div>
            <label htmlFor="totem-select" className="block text-sm font-medium text-gray-700 mb-1">
              Modello Totem
            </label>
            <select
              id="totem-select"
              value={selectedTotemId}
              onChange={(e) => setSelectedTotemId(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {totems.map(totem => (
                <option key={totem.id} value={totem.id}>{totem.name}</option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantità (pz)
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Days */}
          <div>
            <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-1">
              Durata Noleggio (giorni)
            </label>
            <input
              type="number"
              id="days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              min="1"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Destination City */}
          <div>
            <label htmlFor="destinationCity" className="block text-sm font-medium text-gray-700 mb-1">
              Città di Destinazione
            </label>
            <input
              type="text"
              id="destinationCity"
              value={destinationCity}
              onChange={(e) => setDestinationCity(e.target.value)}
              placeholder="Es. Milano"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-bold">Errore</p>
            <p>{error}</p>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calcolo in corso...
              </>
            ) : (
              <>
                <i className="fas fa-calculator mr-3"></i>
                Calcola Preventivo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuoteCalculator;