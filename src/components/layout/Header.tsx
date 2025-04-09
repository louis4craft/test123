
import React from 'react';
import { useLocation } from 'react-router-dom';

const pageTitle = {
  '/': 'Dashboard',
  '/income': 'Einnahmen',
  '/expenses': 'Ausgaben',
};

const Header: React.FC = () => {
  const location = useLocation();
  const title = pageTitle[location.pathname as keyof typeof pageTitle] || 'Finanz-Tracker';

  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 animate-slide-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">
          {location.pathname === '/' && 'Übersicht deiner Finanzen'}
          {location.pathname === '/income' && 'Verwalte deine Einnahmen'}
          {location.pathname === '/expenses' && 'Verwalte deine Ausgaben'}
        </p>
      </div>
    </header>
  );
};

export default Header;
