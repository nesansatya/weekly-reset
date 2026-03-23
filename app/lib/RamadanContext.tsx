'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface RamadanContextType {
  isRamadanMode: boolean;
  toggleRamadanMode: () => void;
  isRamadanActive: boolean;
}

const RamadanContext = createContext<RamadanContextType>({
  isRamadanMode: false,
  toggleRamadanMode: () => {},
  isRamadanActive: false,
});

export function RamadanProvider({ children }: { children: React.ReactNode }) {
  const [isRamadanMode, setIsRamadanMode] = useState(false);

  // Check if Ramadan is currently active (approximate dates)
  const checkRamadanActive = () => {
    const today = new Date();
    const year = today.getFullYear();
    // 2027 Ramadan: approximately Feb 18 - Mar 19
    const ramadanDates: Record<number, { start: Date; end: Date }> = {
      2027: { start: new Date(2027, 1, 18), end: new Date(2027, 2, 19) },
      2028: { start: new Date(2028, 1, 7), end: new Date(2028, 2, 7) },
    };
    const dates = ramadanDates[year];
    if (!dates) return false;
    return today >= dates.start && today <= dates.end;
  };

  const isRamadanActive = checkRamadanActive();

  useEffect(() => {
    const saved = localStorage.getItem('ramadanMode');
    if (saved) setIsRamadanMode(JSON.parse(saved));
  }, []);

  const toggleRamadanMode = () => {
    setIsRamadanMode(prev => {
      const newValue = !prev;
      localStorage.setItem('ramadanMode', JSON.stringify(newValue));
      return newValue;
    });
  };

  return (
    <RamadanContext.Provider value={{ isRamadanMode, toggleRamadanMode, isRamadanActive }}>
      {children}
    </RamadanContext.Provider>
  );
}

export const useRamadan = () => useContext(RamadanContext);