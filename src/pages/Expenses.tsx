
import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionList from '../components/transactions/TransactionList';
import { useFinance } from '../context/FinanceContext';

const Expenses: React.FC = () => {
  const { transactions } = useFinance();
  
  // Calculate total expenses
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return (
    <MainLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-muted-foreground">Ausgaben Gesamt</p>
          <p className="text-2xl font-bold text-finance-expense">
            {totalExpenses.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </p>
        </div>
        
        <TransactionForm type="expense" />
      </div>
      
      <TransactionList type="expense" />
    </MainLayout>
  );
};

export default Expenses;
