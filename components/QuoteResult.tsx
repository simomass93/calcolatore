import React from 'react';
import type { QuoteDetails, TransportOption } from '../types';

interface QuoteResultProps {
  quote: QuoteDetails;
  onReset: () => void;
}

const QuoteResult: React.FC<QuoteResultProps> = ({ quote, onReset }) => {
  const formatCurrency = (amount: number | 'A Preventivo') => {
    if (typeof amount === 'string') return amount;
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="bg-white p-6 rounded-b-xl rounded-tr-xl shadow-lg mt-[-1px] animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <i className="fas fa-file-invoice-dollar mr-3 text-indigo-500"></i>
            Riepilogo Preventivo
        </h2>
        <button
            onClick={onReset}
            className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
        >
            <i className="fas fa-arrow-left mr-2"></i>Nuovo Calcolo
        </button>
      </div>

      <div className="space-y-6">
        {/* Dettagli Noleggio */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold text-lg text-gray-700 mb-2">Dettagli Noleggio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-gray-600">
            <p><span className="font-semibold">Modello Totem:</span> {quote.totem.name}</p>
            <p><span className="font-semibold">Quantità:</span> {quote.quantity} pz</p>
            <p><span className="font-semibold">Durata:</span> {quote.days} giorni</p>
            <p><span className="font-semibold">Città:</span> {quote.destinationCity}</p>
            <p className="sm:col-span-2"><span className="font-semibold">Costo Noleggio:</span> <span className="font-bold text-gray-800">{formatCurrency(quote.rentalCost)}</span></p>
          </div>
        </div>
        
        {/* Opzioni di Trasporto */}
        <div>
          <h3 className="font-bold text-lg text-gray-700 mb-3">Opzioni di Trasporto e Costi Finali</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {quote.transportOptions.map((option, index) => (
              <div key={index} className="p-4 border border-indigo-200 bg-indigo-50 rounded-lg flex flex-col">
                <h4 className="font-bold text-xl text-indigo-800 mb-2">{option.name}</h4>
                <div className="space-y-2 flex-grow">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600">Costo trasporto:</p>
                        <p className="font-semibold text-gray-800">{formatCurrency(option.transportCost)}</p>
                    </div>
                     <p className="text-sm text-gray-500 text-right">{option.details}</p>
                </div>
                <hr className="my-3 border-indigo-200"/>
                <div className="flex justify-between items-center text-lg mt-auto">
                  <p className="font-bold text-indigo-800">Costo Totale:</p>
                  <p className="font-extrabold text-indigo-800">{formatCurrency(option.totalCost)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <p className="text-center mt-8 text-sm text-gray-500">
        Questo è un preventivo preliminare. I costi sono da intendersi IVA esclusa.
      </p>
    </div>
  );
};

export default QuoteResult;
