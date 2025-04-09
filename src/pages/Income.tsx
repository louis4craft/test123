
import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionList from '../components/transactions/TransactionList';
import { useFinance } from '../context/FinanceContext';

const Income: React.FC = () => {
  const { transactions } = useFinance();
  
  // Calculate total income
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return (
    <MainLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-muted-foreground">Einnahmen Gesamt</p>
          <p className="text-2xl font-bold text-finance-income">
            {totalIncome.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </p>
        </div>
        
        <TransactionForm type="income" />
      </div>
      
      <TransactionList type="income" />
    </MainLayout>
  );
};

export default Income;
