import React, { createContext, useContext, useState, useCallback } from 'react';
import { ReturnItem, generateFraudScore, getStatusFromScore } from '@/utils/fraudLogic';

interface DemoContextType {
  isDemo: boolean;
  isDemoRunning: boolean;
  currentDemoStep: number;
  returns: ReturnItem[];
  activeInspection: ReturnItem | null;
  startDemo: () => void;
  stopDemo: () => void;
  addReturn: (returnItem: Omit<ReturnItem, 'id' | 'fraudScore' | 'status' | 'inspectionStage' | 'expiresAt'>) => ReturnItem;
  updateReturn: (id: string, updates: Partial<ReturnItem>) => void;
  setActiveInspection: (item: ReturnItem | null) => void;
  advanceInspectionStage: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemo, setIsDemo] = useState(false);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [currentDemoStep, setCurrentDemoStep] = useState(0);
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [activeInspection, setActiveInspection] = useState<ReturnItem | null>(null);

  const addReturn = useCallback((returnData: Omit<ReturnItem, 'id' | 'fraudScore' | 'status' | 'inspectionStage' | 'expiresAt'>): ReturnItem => {
    const fraudScore = generateFraudScore();
    const newReturn: ReturnItem = {
      ...returnData,
      id: `RET-${String(1000 + returns.length).padStart(4, '0')}`,
      fraudScore,
      status: 'pending',
      inspectionStage: 0,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
    };
    setReturns(prev => [newReturn, ...prev]);
    return newReturn;
  }, [returns.length]);

  const updateReturn = useCallback((id: string, updates: Partial<ReturnItem>) => {
    setReturns(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    if (activeInspection?.id === id) {
      setActiveInspection(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [activeInspection]);

  const advanceInspectionStage = useCallback(() => {
    if (!activeInspection) return;
    
    const nextStage = activeInspection.inspectionStage + 1;
    
    if (nextStage > 5) {
      const finalStatus = getStatusFromScore(activeInspection.fraudScore);
      updateReturn(activeInspection.id, { 
        inspectionStage: 5, 
        status: finalStatus 
      });
    } else {
      updateReturn(activeInspection.id, { 
        inspectionStage: nextStage,
        status: 'inspecting'
      });
    }
  }, [activeInspection, updateReturn]);

  const startDemo = useCallback(() => {
    setIsDemo(true);
    setIsDemoRunning(true);
    setCurrentDemoStep(0);
  }, []);

  const stopDemo = useCallback(() => {
    setIsDemoRunning(false);
    setCurrentDemoStep(0);
  }, []);

  return (
    <DemoContext.Provider
      value={{
        isDemo,
        isDemoRunning,
        currentDemoStep,
        returns,
        activeInspection,
        startDemo,
        stopDemo,
        addReturn,
        updateReturn,
        setActiveInspection,
        advanceInspectionStage,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
