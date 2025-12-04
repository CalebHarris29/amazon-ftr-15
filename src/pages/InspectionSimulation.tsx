import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InspectionProgress } from '@/components/InspectionProgress';
import { RoboticArmAnimation } from '@/components/RoboticArmAnimation';
import { FraudScoreMeter } from '@/components/FraudScoreMeter';
import { useDemo } from '@/context/DemoContext';
import { inspectionStages, generateFraudScore, getStatusFromScore, getStatusBgColor } from '@/utils/fraudLogic';
import { 
  ScanLine, 
  Play,
  Pause,
  RotateCcw,
  Box,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Scale,
  Barcode,
  Camera
} from 'lucide-react';

const InspectionSimulation = () => {
  const { activeInspection } = useDemo();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [fraudScore, setFraudScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [findings, setFindings] = useState<string[]>([]);

  const mockFindings = [
    'Surface scratches detected on device back',
    'Serial number verified: Authentic',
    'Box condition: Minor damage',
    'Weight check: Within tolerance',
    'Accessories: Complete set verified',
  ];

  useEffect(() => {
    if (activeInspection) {
      setFraudScore(activeInspection.fraudScore);
    }
  }, [activeInspection]);

  const runInspection = async () => {
    setIsRunning(true);
    setShowResults(false);
    setCurrentStage(0);
    setFindings([]);
    
    const score = generateFraudScore();
    setFraudScore(score);

    for (let i = 1; i <= 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStage(i);
      
      if (i <= mockFindings.length) {
        setFindings(prev => [...prev, mockFindings[i - 1]]);
      }
    }

    setIsRunning(false);
    setShowResults(true);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentStage(0);
    setShowResults(false);
    setFindings([]);
    setFraudScore(0);
  };

  const status = showResults ? getStatusFromScore(fraudScore) : 'pending';

  const getStatusDisplay = () => {
    switch (status) {
      case 'approved':
        return { icon: CheckCircle, label: 'Approved', color: 'text-success' };
      case 'flagged':
        return { icon: AlertTriangle, label: 'Flagged for Review', color: 'text-warning' };
      case 'rejected':
        return { icon: XCircle, label: 'Rejected', color: 'text-destructive' };
      default:
        return { icon: ScanLine, label: 'Pending', color: 'text-muted-foreground' };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <ScanLine className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Inspection Simulation</h1>
                <p className="text-muted-foreground text-sm">AI-powered robotic inspection demo</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 animate-fade-in">
            <Button
              variant={isRunning ? 'outline' : 'hero'}
              onClick={isRunning ? () => setIsRunning(false) : runInspection}
              disabled={isRunning && currentStage < 5}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Inspection
                </>
              )}
            </Button>
            <Button variant="outline" onClick={resetSimulation}>
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-card rounded-2xl border shadow-card p-6 mb-8 animate-fade-in">
          <InspectionProgress currentStage={currentStage} stages={inspectionStages} />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Animation Panel */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border shadow-card p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">Live Inspection Feed</h2>
              <RoboticArmAnimation isScanning={isRunning} stage={currentStage} />
            </div>

            {/* Stage Details */}
            <div className="bg-card rounded-2xl border shadow-card p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">Detection Overlays</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Camera, label: 'Visual Scan', active: currentStage >= 2 },
                  { icon: Barcode, label: 'Serial Check', active: currentStage >= 3 },
                  { icon: Scale, label: 'Weight Analysis', active: currentStage >= 4 },
                  { icon: Box, label: 'Package Integrity', active: currentStage >= 4 },
                ].map((check, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      check.active 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-muted/50 border-border'
                    }`}
                  >
                    <check.icon className={`w-5 h-5 ${check.active ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-medium ${check.active ? '' : 'text-muted-foreground'}`}>
                      {check.label}
                    </span>
                    {check.active && <CheckCircle className="w-4 h-4 text-success ml-auto" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* AI Findings */}
            <div className="bg-card rounded-2xl border shadow-card p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">AI Findings</h2>
              <div className="space-y-3 min-h-[200px]">
                {findings.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    Run inspection to see AI findings
                  </p>
                ) : (
                  findings.map((finding, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 animate-slide-up"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">{i + 1}</span>
                      </div>
                      <span className="text-sm">{finding}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Final Results */}
            <div className="bg-card rounded-2xl border shadow-card p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">Inspection Summary</h2>
              
              {showResults ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Fraud Score</p>
                      <FraudScoreMeter score={fraudScore} size="lg" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-2">Decision</p>
                      <Badge className={getStatusBgColor(status)}>
                        <statusDisplay.icon className="w-4 h-4" />
                        <span className="ml-1">{statusDisplay.label}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50">
                    <h3 className="font-medium mb-2">Analysis Summary</h3>
                    <p className="text-sm text-muted-foreground">
                      {status === 'approved' && 'Item passed all verification checks. No signs of tampering or fraud detected.'}
                      {status === 'flagged' && 'Some anomalies detected. Manual review recommended before processing.'}
                      {status === 'rejected' && 'Multiple fraud indicators detected. Return request should be denied.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ScanLine className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isRunning ? 'Inspection in progress...' : 'Run inspection to see results'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionSimulation;
