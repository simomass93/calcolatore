import type { Totem } from '../types';
import { supabase } from './supabaseClient';

/**
 * Legge l'inventario condiviso (riga id = 'shared')
 */
export const getSharedTotems = async (): Promise<Totem[]> => {
  try {
    const { data, error } = await supabase
      .from('shared_inventory')
      .select('data')
      .eq('id', 'shared')
      .single();

    if (error && (error as any).code !== 'PGRST116') {
      // PGRST116 = no rows (postgres no rows), gestiamo comunque
      console.error('Errore getSharedTotems:', error);
      throw error;
    }

    if (!data || !data.data) return [];
    return data.data as Totem[];
  } catch (err) {
    console.error('Impossibile leggere inventario condiviso:', err);
    throw err;
  }
};

/**
 * Salva (upsert) l'inventario condiviso nella riga id = 'shared'
 */
export const saveSharedTotems = async (totems: Totem[]): Promise<void> => {
  try {
    const payload = {
      id: 'shared',
      data: totems,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('shared_inventory').upsert(payload, { returning: 'minimal' });
    if (error) {
      console.error('Errore saveSharedTotems:', error);
      throw error;
    }
  } catch (err) {
    console.error('Impossibile salvare inventario condiviso:', err);
    throw err;
  }
};