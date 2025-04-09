import React from 'react';
import { ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { useFinance, Transaction } from '../../context/FinanceContext';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const RecentTransactions: React.FC = () => {
  const { transactions, isLoading, error } = useFinance();
  
  // Get only the 5 most recent transactions
  const recentTransactions = transactions.slice(0, 5);
  
  if (isLoading) {
    return (
      <div className="finance-card glass-card animate-scale-in">
        <h3 className="text-lg font-medium mb-4">Letzte Transaktionen</h3>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="finance-card glass-card animate-scale-in">
        <h3 className="text-lg font-medium mb-4">Letzte Transaktionen</h3>
        <div className="text-center py-6 text-destructive">
          {error}
        </div>
      </div>
    );
  }
  
  if (recentTransactions.length === 0) {
    return (
      <div className="finance-card glass-card animate-scale-in">
        <h3 className="text-lg font-medium mb-4">Letzte Transaktionen</h3>
        <div className="text-center py-6 text-muted-foreground">
          Noch keine Transaktionen vorhanden
        </div>
      </div>
    );
  }
  
  return (
    <div className="finance-card glass-card animate-scale-in">
      <h3 className="text-lg font-medium mb-4">Letzte Transaktionen</h3>
      
      <div className="space-y-4">
        {recentTransactions.map((transaction, index) => (
          <TransactionItem 
            key={transaction.id} 
            transaction={transaction} 
            delay={index * 0.1}
          />
        ))}
      </div>
    </div>
  );
};

const TransactionItem: React.FC<{ transaction: Transaction; delay: number }> = ({ transaction, delay }) => {
  const isIncome = transaction.type === 'income';
  const iconColor = isIncome ? 'text-finance-income' : 'text-finance-expense';
  const amountColor = isIncome ? 'text-finance-income' : 'text-finance-expense';
  const amountPrefix = isIncome ? '+' : '-';
  
  const formattedTime = formatDistanceToNow(transaction.date, { 
    addSuffix: true, 
    locale: de 
  });
  
  return (
    <div 
      className="transaction-item flex items-center justify-between"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-full ${isIncome ? 'bg-finance-income/10' : 'bg-finance-expense/10'} flex items-center justify-center`}>
          {isIncome ? (
            <ArrowUpRight className={`h-5 w-5 ${iconColor}`} />
          ) : (
            <ArrowDownRight className={`h-5 w-5 ${iconColor}`} />
          )}
        </div>
        
        <div>
          <p className="font-medium">{transaction.description}</p>
          <p className="text-sm text-muted-foreground">{formattedTime}</p>
        </div>
      </div>
      
      <span className={`font-medium ${amountColor}`}>
        {amountPrefix}{transaction.amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
      </span>
    </div>
  );
};

export default RecentTransactions;
