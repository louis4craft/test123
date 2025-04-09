
import React, { useEffect, useRef } from 'react';
import { DollarSign } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

const BalanceCard: React.FC = () => {
  const { balance } = useFinance();
  const previousBalanceRef = useRef(balance);
  const animationFrameRef = useRef<number | null>(null);
  const displayBalanceRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    if (!displayBalanceRef.current) return;
    
    const startValue = previousBalanceRef.current;
    const endValue = balance;
    const duration = 1000; // ms
    const startTime = performance.now();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    const animateBalance = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
      const easedProgress = easeOutQuart(progress);
      
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      
      if (displayBalanceRef.current) {
        displayBalanceRef.current.textContent = currentValue.toLocaleString('de-DE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' €';
      }
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateBalance);
      } else {
        previousBalanceRef.current = endValue;
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animateBalance);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [balance]);
  
  const balanceTextColor = balance >= 0 ? 'text-finance-balance' : 'text-finance-expense';

  return (
    <div className="finance-card glass-card animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Aktueller Kontostand</h3>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
      </div>
      
      <div className="mt-2">
        <span 
          ref={displayBalanceRef}
          className={`text-3xl font-bold ${balanceTextColor}`}
        >
          {balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
        </span>
      </div>
    </div>
  );
};

export default BalanceCard;
