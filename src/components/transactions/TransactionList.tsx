import React from 'react';
import { ArrowUpRight, ArrowDownRight, Trash2, Loader2 } from 'lucide-react';
import { useFinance, Transaction } from '../../context/FinanceContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

interface TransactionListProps {
  type?: 'income' | 'expense';
  limit?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({ type, limit }) => {
  const { transactions, deleteTransaction, isLoading, error } = useFinance();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 border-2 border-dashed rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg text-destructive">
        {error}
      </div>
    );
  }
  
  // Filter transactions by type if specified
  const filteredTransactions = type 
    ? transactions.filter(t => t.type === type)
    : transactions;
    
  // Apply limit if specified
  const displayedTransactions = limit 
    ? filteredTransactions.slice(0, limit) 
    : filteredTransactions;
  
  if (displayedTransactions.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">
          {type === 'income' 
            ? 'Noch keine Einnahmen vorhanden.' 
            : type === 'expense' 
              ? 'Noch keine Ausgaben vorhanden.' 
              : 'Noch keine Transaktionen vorhanden.'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 animate-fade-in">
      {displayedTransactions.map((transaction, index) => (
        <TransactionItem 
          key={transaction.id} 
          transaction={transaction} 
          onDelete={deleteTransaction}
          delay={index * 0.05}
        />
      ))}
    </div>
  );
};

const TransactionItem: React.FC<{ 
  transaction: Transaction; 
  onDelete: (id: string) => void;
  delay: number;
}> = ({ transaction, onDelete, delay }) => {
  const isIncome = transaction.type === 'income';
  const iconColor = isIncome ? 'text-finance-income' : 'text-finance-expense';
  const amountColor = isIncome ? 'text-finance-income' : 'text-finance-expense';
  const amountPrefix = isIncome ? '+' : '-';
  
  const formattedDate = format(transaction.date, 'd. MMMM yyyy', { locale: de });
  const formattedTime = format(transaction.date, 'HH:mm', { locale: de });
  
  return (
    <div 
      className="p-4 rounded-xl border bg-card animate-scale-in flex items-center justify-between"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-3">
        <div className={`h-12 w-12 rounded-full ${isIncome ? 'bg-finance-income/10' : 'bg-finance-expense/10'} flex items-center justify-center`}>
          {isIncome ? (
            <ArrowUpRight className={`h-6 w-6 ${iconColor}`} />
          ) : (
            <ArrowDownRight className={`h-6 w-6 ${iconColor}`} />
          )}
        </div>
        
        <div>
          <p className="font-medium">{transaction.description}</p>
          <p className="text-sm text-muted-foreground">{formattedDate} um {formattedTime}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className={`font-medium ${amountColor}`}>
          {amountPrefix}{transaction.amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
        </span>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onDelete(transaction.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TransactionList;
