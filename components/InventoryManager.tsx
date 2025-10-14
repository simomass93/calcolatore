import React, { useState } from 'react';
// Fix: Corrected the import path for types.
import type { Totem, PricingTier } from '../types';

interface TotemInventoryManagerProps {
  totems: Totem[];
  onSave: (updatedTotems: Totem[]) => void;
}

const TotemInventoryManager: React.FC<TotemInventoryManagerProps> = ({ totems, onSave }) => {
  const [localTotems, setLocalTotems] = useState<Totem[]>([...totems]);
  const [newTotemName, setNewTotemName] = useState('');
  const [editingTotemId, setEditingTotemId] = useState<string | null>(null);

  const createDefaultTiers = (): PricingTier[] => [
    { quantity: 1, dailyRate: 100 },
    { quantity: 2, dailyRate: 95 },
    { quantity: 3, dailyRate: 90 },
    { quantity: 4, dailyRate: 85 },
    { quantity: 5, dailyRate: 80 },
    { quantity: 6, dailyRate: 75 },
  ];

  const handleAddNewTotem = () => {
    if (newTotemName.trim() === '') {
      alert('Il nome del totem non può essere vuoto.');
      return;
    }
    const newTotem: Totem = {
      id: Date.now().toString(),
      name: newTotemName.trim(),
      pricingTiers: createDefaultTiers(),
    };
    const updatedTotems = [...localTotems, newTotem];
    setLocalTotems(updatedTotems);
    onSave(updatedTotems);
    setNewTotemName('');
  };

  const handleDeleteTotem = (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo totem?')) {
      const updatedTotems = localTotems.filter(t => t.id !== id);
      setLocalTotems(updatedTotems);
      onSave(updatedTotems);
    }
  };

  const handleRateChange = (totemId: string, quantity: number, value: string) => {
    const newRate = Number(value);
    if (!isNaN(newRate) && newRate >= 0) {
      setLocalTotems(
        localTotems.map(totem =>
          totem.id === totemId
            ? {
                ...totem,
                pricingTiers: totem.pricingTiers.map(tier =>
                  tier.quantity === quantity ? { ...tier, dailyRate: newRate } : tier
                ),
              }
            : totem
        )
      );
    }
  };

  const handleSave = () => {
    onSave(localTotems);
    setEditingTotemId(null);
    alert('Inventario salvato con successo!');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <i className="fas fa-boxes-stacked mr-3 text-indigo-500"></i>
        Gestione Inventario Totem
      </h2>

      {/* Add new totem form */}
      <div className="flex gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
        <input
          type="text"
          value={newTotemName}
          onChange={(e) => setNewTotemName(e.target.value)}
          placeholder="Nome nuovo totem (es. Totem Slim 55)"
          className="flex-grow border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          onClick={handleAddNewTotem}
          className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>Aggiungi
        </button>
      </div>

      {/* List of totems */}
      <div className="space-y-6">
        {localTotems.map(totem => (
          <div key={totem.id} className="border border-gray-200 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-700">{totem.name}</h3>
              <div>
                <button onClick={() => setEditingTotemId(editingTotemId === totem.id ? null : totem.id)} className="text-indigo-600 hover:text-indigo-800 mr-3">
                  <i className="fas fa-edit"></i> Modifica Prezzi
                </button>
                <button onClick={() => handleDeleteTotem(totem.id)} className="text-red-500 hover:text-red-700">
                  <i className="fas fa-trash"></i> Elimina
                </button>
              </div>
            </div>

            {editingTotemId === totem.id && (
              <div className="space-y-3 animate-fade-in">
                {totem.pricingTiers.map(tier => (
                  <div key={tier.quantity} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <label className="font-medium text-gray-600 text-sm">
                      Costo per {tier.quantity} pz
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">€</span>
                      <input
                        type="number"
                        value={tier.dailyRate}
                        onChange={(e) => handleRateChange(totem.id, tier.quantity, e.target.value)}
                        className="w-28 pl-7 pr-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                ))}
                <div className="text-right mt-4">
                    <button onClick={handleSave} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                        <i className="fas fa-save mr-2"></i>Salva Modifiche
                    </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TotemInventoryManager;
