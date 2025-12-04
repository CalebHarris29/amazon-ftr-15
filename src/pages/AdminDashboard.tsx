import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';
import { RoboticArmAnimation } from '@/components/RoboticArmAnimation';
import { useDemo } from '@/context/DemoContext';
import { generateMockReturns, ReturnItem } from '@/utils/fraudLogic';
import { 
  LayoutDashboard, 
  Package,
  AlertTriangle,
  Clock,
  TrendingUp,
  Download,
  Settings,
  Eye,
  SlidersHorizontal,
  FileText,
  Bot,
  ScanEye,
  ShieldCheck,
  BarChart3
} from 'lucide-react';

const AdminDashboard = () => {
  const { returns } = useDemo();
  const [allReturns, setAllReturns] = useState<ReturnItem[]>([]);
  const [fraudThreshold, setFraudThreshold] = useState(70);
  const [pendingReview, setPendingReview] = useState<ReturnItem[]>([]);

  useEffect(() => {
    const mockReturns = generateMockReturns(25);
    const combined = [...returns, ...mockReturns];
    setAllReturns(combined);
    setPendingReview(combined.filter(r => r.status === 'flagged').slice(0, 5));
  }, [returns]);

  const stats = {
    totalToday: allReturns.length,
    fraudPercentage: Math.round((allReturns.filter(r => r.fraudScore > 70).length / allReturns.length) * 100) || 0,
    avgInspectionTime: '45s',
    pendingReview: allReturns.filter(r => r.status === 'flagged').length,
  };

  const handleExport = () => {
    // Mock export
    const data = JSON.stringify(allReturns, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `returns-summary-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground text-sm">Amazon Associate Control Center</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 animate-fade-in">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export Summary
            </Button>
            <Button variant="default">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Returns Today"
            value={stats.totalToday}
            icon={Package}
            trend="up"
            trendValue="+12% from yesterday"
            variant="primary"
          />
          <StatCard
            title="Fraudulent Rate"
            value={`${stats.fraudPercentage}%`}
            icon={AlertTriangle}
            trend="down"
            trendValue="-3% this week"
            variant="warning"
          />
          <StatCard
            title="Avg. Inspection Time"
            value={stats.avgInspectionTime}
            icon={Clock}
            trend="down"
            trendValue="5s faster"
            variant="success"
          />
          <StatCard
            title="Pending Review"
            value={stats.pendingReview}
            icon={Eye}
            subtitle="Requires attention"
            variant="destructive"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pipeline Visualization */}
          <div className="lg:col-span-2 bg-card rounded-2xl border shadow-card p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-6">Inspection Pipeline</h2>
            
            <div className="flex items-center justify-between mb-8">
              {[
                { icon: Package, label: 'Received', count: 156 },
                { icon: Bot, label: 'Robotic Arm', count: 142 },
                { icon: ScanEye, label: 'AI Vision', count: 138 },
                { icon: ShieldCheck, label: 'Verification', count: 130 },
                { icon: BarChart3, label: 'Results', count: 125 },
              ].map((stage, i) => (
                <div key={i} className="flex flex-col items-center relative">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <stage.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{stage.label}</span>
                  <Badge variant="info" className="mt-1">{stage.count}</Badge>
                  {i < 4 && (
                    <div className="absolute top-7 left-full w-8 h-0.5 bg-border -translate-x-4" />
                  )}
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <RoboticArmAnimation isScanning stage={3} />
              
              <div className="space-y-4">
                <h3 className="font-medium">Live Activity</h3>
                {[
                  { time: '2s ago', action: 'RET-1042 completed inspection', type: 'success' },
                  { time: '15s ago', action: 'RET-1041 flagged for review', type: 'warning' },
                  { time: '32s ago', action: 'RET-1040 approved', type: 'success' },
                  { time: '1m ago', action: 'RET-1039 rejected - fraud detected', type: 'error' },
                  { time: '2m ago', action: 'RET-1038 completed inspection', type: 'success' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/50">
                    <span className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-success' : 
                      activity.type === 'warning' ? 'bg-warning' : 'bg-destructive'
                    }`} />
                    <span className="flex-1">{activity.action}</span>
                    <span className="text-muted-foreground text-xs">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="space-y-6">
            {/* Fraud Threshold */}
            <div className="bg-card rounded-2xl border shadow-card p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">Fraud Threshold</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current threshold</span>
                  <span className="text-2xl font-bold text-primary">{fraudThreshold}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={fraudThreshold}
                  onChange={(e) => setFraudThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Lenient (50)</span>
                  <span>Strict (95)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Items with fraud score above {fraudThreshold} will be flagged for manual review
                </p>
              </div>
            </div>

            {/* Pending Review */}
            <div className="bg-card rounded-2xl border shadow-card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Manual Review Queue</h2>
                <Badge variant="destructive">{pendingReview.length}</Badge>
              </div>
              <div className="space-y-3">
                {pendingReview.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{item.itemName}</p>
                      <p className="text-xs text-muted-foreground">{item.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">{item.fraudScore}</Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-2xl border shadow-card p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <SlidersHorizontal className="w-4 h-4" />
                  Override Inspection Decision
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4" />
                  Add Notes to Case
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4" />
                  View Analytics
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
