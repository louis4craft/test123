
import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import BalanceCard from '../components/dashboard/BalanceCard';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import { useFinance } from '../context/FinanceContext';
import { ChartBar } from 'lucide-react';

const Index: React.FC = () => {
  const { transactions } = useFinance();
  
  // Calculate total income and expenses
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Card */}
        <BalanceCard />
        
        {/* Summary Card */}
        <div className="finance-card glass-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Zusammenfassung</h3>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ChartBar className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-finance-income/10">
              <p className="text-sm text-muted-foreground">Einnahmen gesamt</p>
              <p className="text-xl font-semibold text-finance-income">
                {totalIncome.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-finance-expense/10">
              <p className="text-sm text-muted-foreground">Ausgaben gesamt</p>
              <p className="text-xl font-semibold text-finance-expense">
                {totalExpenses.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </p>
            </div>
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div className="md:col-span-2">
          <RecentTransactions />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
