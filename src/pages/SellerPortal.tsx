import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CountdownTimer } from '@/components/CountdownTimer';
import { FraudScoreMeter } from '@/components/FraudScoreMeter';
import { useDemo } from '@/context/DemoContext';
import { generateMockReturns, getStatusBgColor, ReturnItem } from '@/utils/fraudLogic';
import { 
  Store, 
  Search, 
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const SellerPortal = () => {
  const { returns } = useDemo();
  const [allReturns, setAllReturns] = useState<ReturnItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // Merge context returns with mock data
    const mockReturns = generateMockReturns(12);
    setAllReturns([...returns, ...mockReturns]);
  }, [returns]);

  const filteredReturns = allReturns.filter((item) => {
    const matchesSearch = 
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const paginatedReturns = filteredReturns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'flagged':
        return <AlertTriangle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Store className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Seller Portal</h1>
                <p className="text-muted-foreground text-sm">Manage your return inspections</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search returns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="flagged">Flagged</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Returns', value: allReturns.length, variant: 'default' as const },
            { label: 'Approved', value: allReturns.filter(r => r.status === 'approved').length, variant: 'success' as const },
            { label: 'Flagged', value: allReturns.filter(r => r.status === 'flagged').length, variant: 'warning' as const },
            { label: 'Rejected', value: allReturns.filter(r => r.status === 'rejected').length, variant: 'destructive' as const },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-xl border p-4 shadow-card animate-scale-in" style={{ animationDelay: `${i * 50}ms` }}>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Returns Table */}
        <div className="bg-card rounded-2xl border shadow-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-semibold text-sm">Customer</th>
                  <th className="text-left p-4 font-semibold text-sm">Product</th>
                  <th className="text-left p-4 font-semibold text-sm">Fraud Score</th>
                  <th className="text-left p-4 font-semibold text-sm">Status</th>
                  <th className="text-left p-4 font-semibold text-sm">Time Remaining</th>
                  <th className="text-left p-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReturns.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{item.customerName}</p>
                        <p className="text-sm text-muted-foreground">{item.orderId}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{item.itemName}</p>
                      <p className="text-sm text-muted-foreground capitalize">{item.returnType}</p>
                    </td>
                    <td className="p-4">
                      <FraudScoreMeter score={item.fraudScore} size="sm" />
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusBgColor(item.status)}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1 capitalize">{item.status}</span>
                      </Badge>
                    </td>
                    <td className="p-4 min-w-[140px]">
                      <CountdownTimer expiresAt={item.expiresAt} />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3" />
                          Review
                        </Button>
                        <Button variant="ghost" size="sm">
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredReturns.length)} of {filteredReturns.length} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              )).slice(0, 5)}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerPortal;
