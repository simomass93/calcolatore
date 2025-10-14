import React, { useState, useEffect } from 'react';
import TotemInventoryManager from './components/InventoryManager';
import QuoteCalculator from './components/QuoteCalculator';
import type { Totem } from './types';
import { getSharedTotems, saveSharedTotems } from './services/publicTotemService';

type View = 'calculator' | 'inventory';

const initialTotems: Totem[] = [
  { 
    id: '1', 
    name: 'Totem Standard 50"',
    pricingTiers: [
      { quantity: 1, dailyRate: 100 },
      { quantity: 2, dailyRate: 95 },
      { quantity: 3, dailyRate: 90 },
      { quantity: 4, dailyRate: 85 },
      { quantity: 5, dailyRate: 80 },
      { quantity: 6, dailyRate: 75 },
    ]
  },
];

const App: React.FC = () => {
  const [totems, setTotems] = useState<Totem[]>(initialTotems);
  const [activeView, setActiveView] = useState<View>('calculator');
  const [loadingInventory, setLoadingInventory] = useState<boolean>(true);

  // Caricamento iniziale: prova Supabase, altrimenti fallback localStorage/initial
  useEffect(() => {
    let mounted = true;
    const fetchInventory = async () => {
      try {
        const shared = await getSharedTotems();
        if (mounted && Array.isArray(shared) && shared.length > 0) {
          setTotems(shared);
          try { localStorage.setItem('totemInventory', JSON.stringify(shared)); } catch {}
        } else {
          // fallback localStorage
          try {
            const saved = localStorage.getItem('totemInventory');
            if (saved) setTotems(JSON.parse(saved));
            else setTotems(initialTotems);
          } catch {
            setTotems(initialTotems);
          }
        }
      } catch (err) {
        // fallback a localStorage se Supabase non risponde
        try {
          const saved = localStorage.getItem('totemInventory');
          if (saved) setTotems(JSON.parse(saved));
          else setTotems(initialTotems);
        } catch {
          setTotems(initialTotems);
        }
      } finally {
        if (mounted) setLoadingInventory(false);
      }
    };
    fetchInventory();
    return () => { mounted = false; };
  }, []);

  const handleSaveTotems = async (newTotems: Totem[]) => {
    setTotems(newTotems);
    try {
      await saveSharedTotems(newTotems);
    } catch (err) {
      console.warn('Salvataggio su Supabase fallito, salvato solo localmente:', err);
    }
    try {
      localStorage.setItem('totemInventory', JSON.stringify(newTotems));
    } catch {}
  };

  if (loadingInventory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Caricamento inventario...</div>
      </div>
    );
  }

  const NavButton: React.FC<{view: View; label: string; icon: string;}> = ({view, label, icon}) => {
    const isActive = activeView === view;
    return (
        <button
            onClick={() => setActiveView(view)}
            className={`flex-1 py-3 px-4 text-center font-semibold rounded-t-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
                isActive 
                ? 'bg-white text-indigo-600 shadow-md' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
        >
            <i className={`fas ${icon}`}></i>
            {label}
        </button>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            Preventivo Noleggio Totem
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Un calcolatore rapido per i tuoi eventi
          </p>
        </header>
        
        <nav className="flex mb-[-1px] z-10 relative">
            <NavButton view="calculator" label="Calcolatore" icon="fa-calculator" />
            <NavButton view="inventory" label="Inventario" icon="fa-boxes-stacked" />
        </nav>

        <main>
          {activeView === 'calculator' ? (
             totems.length > 0 ? (
                <QuoteCalculator totems={totems} />
              ) : (
                <div className="bg-white p-6 rounded-b-xl rounded-tr-xl shadow-lg">
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
                      <p className="font-bold">Inventario Vuoto</p>
                      <p>Per favore, vai alla scheda "Inventario" e aggiungi almeno un totem per poter creare un preventivo.</p>
                    </div>
                </div>
              )
          ) : (
            <TotemInventoryManager totems={totems} onSave={handleSaveTotems} />
          )}
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Totem Rental Services. Tutti i diritti riservati.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;