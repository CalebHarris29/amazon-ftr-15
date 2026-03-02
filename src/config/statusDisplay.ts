import type { LucideIcon } from 'lucide-react';
import { CheckCircle, AlertTriangle, XCircle, Eye, ScanLine } from 'lucide-react';

export type ReturnStatus = 'approved' | 'flagged' | 'rejected' | 'inspecting' | 'pending';

export interface StatusDisplayMeta {
  /** Human-readable label shown in badges and tables */
  label: string;
  /** Optional, more descriptive label when needed in specific views */
  longLabel?: string;
  /** Tailwind classes for standalone text (no background) */
  textClassName: string;
  /** Tailwind classes for badges / chips (bg + text + border) */
  badgeClassName: string;
  /** Icon used to visually represent this status */
  icon: LucideIcon;
  /** Optional descriptive copy used in summaries or tooltips */
  analysisSummary?: string;
}

export const STATUS_DISPLAY_CONFIG: Record<ReturnStatus, StatusDisplayMeta> = {
  approved: {
    label: 'Approved',
    textClassName: 'text-success',
    badgeClassName: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle,
    analysisSummary:
      'Item passed all verification checks. No signs of tampering or fraud detected.',
  },
  flagged: {
    label: 'Flagged',
    longLabel: 'Flagged for Review',
    textClassName: 'text-warning',
    badgeClassName: 'bg-warning/10 text-warning border-warning/20',
    icon: AlertTriangle,
    analysisSummary:
      'Some anomalies detected. Manual review recommended before processing.',
  },
  rejected: {
    label: 'Rejected',
    textClassName: 'text-destructive',
    badgeClassName: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: XCircle,
    analysisSummary:
      'Multiple fraud indicators detected. Return request should be denied.',
  },
  inspecting: {
    label: 'Inspecting',
    textClassName: 'text-primary',
    badgeClassName: 'bg-primary/10 text-primary border-primary/20',
    icon: ScanLine,
    analysisSummary: 'Our AI-powered system is currently inspecting your item.',
  },
  pending: {
    label: 'Pending',
    textClassName: 'text-muted-foreground',
    badgeClassName: 'bg-muted text-muted-foreground border-border',
    icon: Eye,
    analysisSummary: 'Inspection has not started yet. Run or resume inspection to see results.',
  },
};

export const getStatusDisplay = (status: ReturnStatus): StatusDisplayMeta => {
  return STATUS_DISPLAY_CONFIG[status];
};

