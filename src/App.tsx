import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DemoProvider } from "@/context/DemoContext";
import { AppSidebar } from "@/components/AppSidebar";
import Landing from "./pages/Landing";
import CustomerPortal from "./pages/CustomerPortal";
import SellerPortal from "./pages/SellerPortal";
import AdminDashboard from "./pages/AdminDashboard";
import InspectionSimulation from "./pages/InspectionSimulation";
import NotFound from "./pages/NotFound";
import RobotControl from "./pages/RobotControl";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <main className="flex-1 lg:ml-64">
        {children}
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DemoProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout><Landing /></AppLayout>} />
            <Route path="/customer" element={<AppLayout><CustomerPortal /></AppLayout>} />
            <Route path="/seller" element={<AppLayout><SellerPortal /></AppLayout>} />
            <Route path="/admin" element={<AppLayout><AdminDashboard /></AppLayout>} />
            <Route path="/inspection" element={<AppLayout><InspectionSimulation /></AppLayout>} />
            <Route path="/operator" element={<AppLayout><RobotControl /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DemoProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
