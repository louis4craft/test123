
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  supabase, 
  mapDbToTransaction, 
  TransactionDB, 
  initializeDatabase,
  isSupabaseAvailable 
} from '../lib/supabase';

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: Date;
};

type FinanceContextType = {
  transactions: Transaction[];
  balance: number;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: string) => void;
  isLoading: boolean;
  error: string | null;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Helper function to generate UUID that works across browsers
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [useLocalStorage, setUseLocalStorage] = useState<boolean>(!isSupabaseAvailable);
  
  // Lade Transaktionen beim ersten Render
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        
        // Wenn Supabase nicht verfügbar ist, lade direkt aus dem localStorage
        if (!isSupabaseAvailable) {
          setUseLocalStorage(true);
          loadFromLocalStorage();
          return;
        }
        
        // Initialisiere die Datenbank, falls nötig
        const dbStatus = await initializeDatabase();
        
        if (!dbStatus.success) {
          setUseLocalStorage(true);
          loadFromLocalStorage();
          return;
        }
        
        // Hole Transaktionen aus Supabase
        const { data, error } = await supabase
          .from('transactions')
          .select('*');
          
        // Sortieren der Daten nach Datum (neueste zuerst)
        const sortedData = data ? [...data].sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ) : [];
        
        if (error) {
          setUseLocalStorage(true);
          loadFromLocalStorage();
          return;
        }
        
        // Konvertiere DB-Format zum App-Format
        const formattedTransactions = (sortedData as TransactionDB[]).map(mapDbToTransaction);
        setTransactions(formattedTransactions);
        setError(null);
      } catch (err: any) {
        console.error('Fehler beim Laden der Transaktionen:', err);
        
        setUseLocalStorage(true);
        
        // Zeige eine benutzerfreundliche Nachricht
        if (useLocalStorage) {
          setError('Verbindung zur Datenbank nicht möglich. Lokale Datenspeicherung wird verwendet.');
          toast.error('Datenbank nicht verfügbar. Daten werden lokal gespeichert.', {
            position: 'top-center',
            duration: 5000,
          });
        } else {
          setError('Transaktionen konnten nicht geladen werden. Versuche es später nochmal.');
        }
        
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    const loadFromLocalStorage = () => {
      // Fallback auf lokale Daten, falls vorhanden
      const savedTransactions = localStorage.getItem('transactions');
      if (savedTransactions) {
        try {
          const parsedTransactions = JSON.parse(savedTransactions).map((tx: any) => ({
            ...tx,
            date: new Date(tx.date)
          }));
          setTransactions(parsedTransactions);
          toast.info('Daten werden aus dem lokalen Speicher geladen.');
        } catch (e) {
          console.error('Fehler beim Parsen der lokalen Transaktionen:', e);
        }
      }
    };
    
    fetchTransactions();
  }, []);
  
  // Berechne den Kontostand, wenn sich Transaktionen ändern
  useEffect(() => {
    const newBalance = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        return acc + transaction.amount;
      } else {
        return acc - transaction.amount;
      }
    }, 0);
    
    setBalance(newBalance);
    
    // Speichere als Backup auch im localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);
  
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newId = generateUUID();
    const now = new Date();
    
    // Erstelle die neue Transaktion
    const newTransaction: Transaction = {
      ...transaction,
      id: newId,
      date: now,
    };
    
    // Überprüfe, ob diese Ausgabe das Konto ins Minus bringen würde
    if (transaction.type === 'expense' && balance - transaction.amount < 0) {
      // Zeige Warnung, aber erlaube die Transaktion
      toast.warning('Achtung: Diese Ausgabe wird dein Konto ins Minus bringen!', {
        position: 'top-center',
        duration: 4000,
      });
    }
    
    try {
      // Optimistisches Update der UI
      setTransactions(prev => [newTransaction, ...prev]);
      
      if (isSupabaseAvailable && !useLocalStorage) {
        // Speichere in Supabase
        const { error } = await supabase.from('transactions').insert({
          id: newId,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          created_at: now.toISOString(),
        });
        
        if (error) {
          throw error;
        }
      } else {
        // Wenn Supabase nicht verfügbar ist, speichere nur lokal
        toast.info('Transaktion wird nur lokal gespeichert.', {
          position: 'top-center',
        });
      }
      
      toast.success(
        transaction.type === 'income' 
          ? 'Einnahme erfolgreich hinzugefügt' 
          : 'Ausgabe erfolgreich hinzugefügt', 
        { position: 'top-center' }
      );
    } catch (err) {
      console.error('Fehler beim Hinzufügen der Transaktion:', err);
      // Entferne die Transaktion wieder aus dem State, falls das Speichern fehlgeschlagen ist
      setTransactions(prev => prev.filter(t => t.id !== newId));
      toast.error('Transaktion konnte nicht gespeichert werden. Versuche es später nochmal.', {
        position: 'top-center',
      });
    }
  };
  
  const deleteTransaction = async (id: string) => {
    try {
      // Optimistisches Update der UI
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      
      if (isSupabaseAvailable && !useLocalStorage) {
        // Lösche aus Supabase
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw error;
        }
      } else {
        // Wenn Supabase nicht verfügbar ist, löschen wir nur lokal
        toast.info('Transaktion wird nur lokal gelöscht.', {
          position: 'top-center',
        });
      }
      
      toast.success('Transaktion gelöscht', { position: 'top-center' });
    } catch (err) {
      console.error('Fehler beim Löschen der Transaktion:', err);
      
      // Lade alle Transaktionen neu, falls das Löschen fehlgeschlagen ist
      loadAllTransactions();
      
      toast.error('Transaktion konnte nicht gelöscht werden. Versuche es später nochmal.', {
        position: 'top-center',
      });
    }
  };
  
  const loadAllTransactions = async () => {
    if (isSupabaseAvailable && !useLocalStorage) {
      try {
        const { data } = await supabase
          .from('transactions')
          .select('*');
        
        // Sortieren der Daten nach Datum (neueste zuerst)
        const sortedData = data ? [...data].sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ) : [];
        
        if (data) {
          setTransactions((sortedData as TransactionDB[]).map(mapDbToTransaction));
        }
      } catch (e) {
        console.error('Fehler beim Neuladen der Transaktionen:', e);
        loadFromLocalStorage();
      }
    } else {
      loadFromLocalStorage();
    }
  };
  
  const loadFromLocalStorage = () => {
    // Fallback auf lokale Daten, falls vorhanden
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      try {
        const parsedTransactions = JSON.parse(savedTransactions).map((tx: any) => ({
          ...tx,
          date: new Date(tx.date)
        }));
        setTransactions(parsedTransactions);
      } catch (e) {
        console.error('Fehler beim Parsen der lokalen Transaktionen:', e);
      }
    }
  };
  
  return (
    <FinanceContext.Provider value={{ 
      transactions, 
      balance, 
      addTransaction, 
      deleteTransaction,
      isLoading,
      error 
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
