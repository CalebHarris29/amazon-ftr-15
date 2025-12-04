import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InspectionProgress } from '@/components/InspectionProgress';
import { useDemo } from '@/context/DemoContext';
import { inspectionStages, returnReasons } from '@/utils/fraudLogic';
import { 
  Package, 
  Upload, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const CustomerPortal = () => {
  const navigate = useNavigate();
  const { addReturn, setActiveInspection } = useDemo();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [formData, setFormData] = useState({
    customerName: '',
    orderId: '',
    itemName: '',
    reason: '',
    returnType: 'refund' as 'refund' | 'replacement',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.orderId || !formData.itemName || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newReturn = addReturn({
      ...formData,
      submittedAt: new Date(),
    });

    setIsSubmitted(true);
    setActiveInspection(newReturn);
    toast.success('Return request submitted successfully!');

    // Simulate inspection progress
    for (let i = 1; i <= 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStage(i);
    }
  };

  const handleViewResults = () => {
    navigate('/inspection');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl border shadow-card p-8 animate-scale-in">
            <div className="text-center mb-8">
              {currentStage >= 5 ? (
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Package className="w-10 h-10 text-primary" />
                </div>
              )}
              <h1 className="text-2xl font-bold mb-2">
                {currentStage >= 5 ? 'Inspection Complete!' : 'Processing Your Return'}
              </h1>
              <p className="text-muted-foreground">
                {currentStage >= 5 
                  ? 'Your return has been processed. View the inspection results below.'
                  : 'Our AI-powered robotic system is inspecting your item...'}
              </p>
            </div>

            <div className="mb-8 p-6 bg-secondary/50 rounded-xl">
              <h3 className="font-semibold mb-4">Return Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="ml-2 font-medium">{formData.customerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="ml-2 font-medium">{formData.orderId}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Item:</span>
                  <span className="ml-2 font-medium">{formData.itemName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 font-medium capitalize">{formData.returnType}</span>
                </div>
              </div>
            </div>

            <InspectionProgress currentStage={currentStage} stages={inspectionStages} />

            {currentStage >= 5 && (
              <div className="mt-8 text-center">
                <Button variant="hero" size="lg" onClick={handleViewResults}>
                  View Inspection Results
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-slide-up">
          <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Return Request</h1>
          <p className="text-muted-foreground">
            Submit your return for AI-powered inspection
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border shadow-card p-8 space-y-6 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                placeholder="Enter your name"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID *</Label>
              <Input
                id="orderId"
                placeholder="e.g., ORD-123456"
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name *</Label>
            <Input
              id="itemName"
              placeholder="e.g., iPhone 15 Pro"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Return *</Label>
            <select
              id="reason"
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            >
              <option value="">Select a reason</option>
              {returnReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Return Type *</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="returnType"
                  value="refund"
                  checked={formData.returnType === 'refund'}
                  onChange={(e) => setFormData({ ...formData, returnType: e.target.value as 'refund' | 'replacement' })}
                  className="w-4 h-4 text-primary"
                />
                <span>Refund</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="returnType"
                  value="replacement"
                  checked={formData.returnType === 'replacement'}
                  onChange={(e) => setFormData({ ...formData, returnType: e.target.value as 'refund' | 'replacement' })}
                  className="w-4 h-4 text-primary"
                />
                <span>Replacement</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Upload Photo/Video (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, MP4 up to 50MB
              </p>
            </div>
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full">
            Submit Return Request
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CustomerPortal;
