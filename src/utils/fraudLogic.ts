// Mock fraud detection logic for demo purposes
import { getStatusDisplay, type ReturnStatus } from '@/config/statusDisplay';

export interface ReturnItem {
  id: string;
  customerName: string;
  orderId: string;
  itemName: string;
  reason: string;
  returnType: 'refund' | 'replacement';
  imageUrl?: string;
  submittedAt: Date;
  fraudScore: number;
  status: ReturnStatus;
  inspectionStage: number;
  expiresAt: Date;
  notes?: string;
}

export const generateFraudScore = (): number => {
  return Math.floor(Math.random() * 100) + 1;
};

export const getStatusFromScore = (score: number): Extract<
  ReturnStatus,
  'approved' | 'flagged' | 'rejected'
> => {
  if (score > 90) return 'rejected';
  if (score > 70) return 'flagged';
  return 'approved';
};

export const getStatusColor = (status: ReturnStatus): string => {
  return getStatusDisplay(status).textClassName;
};

export const getStatusBgColor = (status: ReturnStatus): string => {
  return getStatusDisplay(status).badgeClassName;
};

export const formatTimeRemaining = (expiresAt: Date): string => {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const inspectionStages = [
  { id: 1, name: 'Item Received', icon: 'Package' },
  { id: 2, name: 'Robotic Arm Inspection', icon: 'Bot' },
  { id: 3, name: 'AI Damage Detection', icon: 'ScanEye' },
  { id: 4, name: 'Authenticity Verification', icon: 'ShieldCheck' },
  { id: 5, name: 'Fraud Score Generated', icon: 'BarChart3' },
];

export const returnReasons = [
  'Item arrived damaged',
  'Wrong item received',
  'Item not as described',
  'Changed my mind',
  'Better price found elsewhere',
  'Item defective',
  'Missing parts or accessories',
  'Arrived too late',
];

export const generateMockReturns = (count: number): ReturnItem[] => {
  const customerNames = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Wilson', 'Lisa Brown', 'David Lee', 'Jennifer Martinez'];
  const items = ['iPhone 15 Pro', 'Sony WH-1000XM5', 'MacBook Air M3', 'Nintendo Switch', 'Samsung TV 65"', 'Dyson V15', 'iPad Pro 12.9', 'AirPods Pro'];
  
  return Array.from({ length: count }, (_, i) => {
    const fraudScore = generateFraudScore();
    const submittedAt = new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000);
    const expiresAt = new Date(submittedAt.getTime() + 72 * 60 * 60 * 1000);
    
    return {
      id: `RET-${String(1000 + i).padStart(4, '0')}`,
      customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      itemName: items[Math.floor(Math.random() * items.length)],
      reason: returnReasons[Math.floor(Math.random() * returnReasons.length)],
      returnType: Math.random() > 0.5 ? 'refund' : 'replacement',
      submittedAt,
      fraudScore,
      status: getStatusFromScore(fraudScore),
      inspectionStage: 5,
      expiresAt,
    };
  });
};
