
import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TransactionFormProps {
  type: 'income' | 'expense';
}

const TransactionForm: React.FC<TransactionFormProps> = ({ type }) => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const { addTransaction, balance } = useFinance();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) {
      return;
    }
    
    // Hide the warning if it was shown
    setShowWarning(false);
    
    // Add the transaction
    addTransaction({
      type,
      description: description.trim(),
      amount: numAmount,
    });
    
    // Reset the form
    setDescription('');
    setAmount('');
    setOpen(false);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '.');
    setAmount(value);
    
    // Show warning if this expense would result in a negative balance
    if (type === 'expense') {
      const numAmount = parseFloat(value);
      if (!isNaN(numAmount) && numAmount > 0 && numAmount > balance) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="animate-scale-in">
          <Plus className="mr-2 h-4 w-4" />
          {type === 'income' ? 'Einnahme hinzufügen' : 'Ausgabe hinzufügen'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === 'income' ? 'Neue Einnahme' : 'Neue Ausgabe'}
          </DialogTitle>
          <DialogDescription>
            {type === 'income' 
              ? 'Füge eine neue Einnahme zu deinem Konto hinzu.' 
              : 'Füge eine neue Ausgabe zu deinem Konto hinzu.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'income' ? 'z.B. Gehalt' : 'z.B. Miete'}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Betrag (€)</Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              required
            />
          </div>
          
          {showWarning && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive animate-scale-in">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Achtung: Diese Ausgabe wird dein Konto ins Minus bringen!
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button type="submit" className="w-full">
              {type === 'income' ? 'Einnahme speichern' : 'Ausgabe speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionForm;
