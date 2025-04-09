
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChartBar, DollarSign, Plus, Minus } from 'lucide-react';
import Header from './Header';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar for MD and larger */}
      <aside className="hidden md:flex flex-col w-64 p-6 bg-card border-r">
        <div className="mb-8">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span>Finanz-Tracker</span>
          </h2>
        </div>
        
        <nav className="space-y-2">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end
          >
            <ChartBar className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/income" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Plus className="h-5 w-5" />
            <span>Einnahmen</span>
          </NavLink>
          
          <NavLink 
            to="/expenses" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Minus className="h-5 w-5" />
            <span>Ausgaben</span>
          </NavLink>
        </nav>
      </aside>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-10">
        <nav className="flex justify-around items-center p-2">
          <NavLink 
            to="/" 
            className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
            end
          >
            <ChartBar className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/income" 
            className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs mt-1">Einnahmen</span>
          </NavLink>
          
          <NavLink 
            to="/expenses" 
            className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Minus className="h-6 w-6" />
            <span className="text-xs mt-1">Ausgaben</span>
          </NavLink>
        </nav>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
        <Header />
        <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="page-transition">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
