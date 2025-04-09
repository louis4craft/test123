
import { createClient } from '@supabase/supabase-js';

// Define if Supabase client is available
export let isSupabaseAvailable = false;

// Try to get values from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a null client for type safety
let supabaseClient: ReturnType<typeof createClient> | null = null;

// Only initialize if both URL and key are provided
if (supabaseUrl && supabaseAnonKey) {
  try {
    // Create the Supabase client
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    isSupabaseAvailable = true;
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
  }
} else {
  console.warn('Supabase URL or Anon Key not provided. Using local storage mode.');
}

// Create a mock client for when Supabase is not available
const mockClient = {
  from: (table: string) => ({
    select: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') }),
    insert: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') }),
    delete: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') }),
    order: () => ({ 
      data: null, 
      error: new Error('Supabase not initialized'),
      limit: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') }),
    }),
    limit: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') }),
    eq: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') }),
  }),
};

// Export either the real client or the mock client
export const supabase = supabaseClient || mockClient;

// Definiere die Typen für unsere Datenbank-Tabelle
export type TransactionDB = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  created_at: string;
  user_id?: string;
};

// Hilfsfunktion zum Konvertieren vom DB-Format zum App-Format
export const mapDbToTransaction = (dbTransaction: TransactionDB) => {
  return {
    id: dbTransaction.id,
    type: dbTransaction.type,
    amount: dbTransaction.amount,
    description: dbTransaction.description,
    date: new Date(dbTransaction.created_at),
  };
};

// Hilfsfunktion zum Initialisieren der Datenbank (wenn nötig)
export const initializeDatabase = async () => {
  if (!isSupabaseAvailable) {
    console.warn('Supabase client not initialized, skipping database initialization');
    return { success: false, error: 'Supabase not available' };
  }
  
  try {
    // Prüfe, ob die Tabelle bereits existiert
    const { error } = await supabase
      .from('transactions')
      .select('id')
      .limit(1);
    
    // Wenn es einen Fehler gibt und die Tabelle nicht existiert, logge eine Nachricht
    if (error && error.code === '42P01') {
      console.log('Transactions table does not exist. Please create it in the Supabase dashboard.');
      return { success: false, error: 'Table does not exist' };
    }
    
    return { success: true, error: null };
  } catch (err) {
    console.error('Error checking database:', err);
    return { success: false, error: err };
  }
};
