import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TooltipContextType {
  activeTooltipId: string | null;
  setActiveTooltipId: (id: string | null) => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export const TooltipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  return (
    <TooltipContext.Provider value={{ activeTooltipId, setActiveTooltipId }}>
      {children}
    </TooltipContext.Provider>
  );
};

export const useTooltip = (): TooltipContextType => {
  const context = useContext(TooltipContext);
  if (context === undefined) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
};
