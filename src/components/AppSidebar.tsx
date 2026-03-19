import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  Store,
  LayoutDashboard,
  ScanLine,
  Play,
  X,
  Menu,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDemo } from '@/context/DemoContext';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/customer', label: 'Customer Portal', icon: Package },
  { path: '/seller', label: 'Seller Portal', icon: Store },
  { path: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
  { path: '/inspection', label: 'Inspection Sim', icon: ScanLine },
  { path: '/operator', label: 'Robot Control', icon: Cpu },
];

export const AppSidebar = () => {
  const location = useLocation();
  const { isDemoRunning, startDemo, stopDemo } = useDemo();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card p-2 rounded-lg shadow-md"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "w-64 lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <ScanLine className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-sidebar-foreground">ReturnGuard</h1>
                <p className="text-xs text-sidebar-foreground/60">AI Inspection System</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Demo Mode Button */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant={isDemoRunning ? "destructive" : "accent"}
              className="w-full"
              onClick={isDemoRunning ? stopDemo : startDemo}
            >
              {isDemoRunning ? (
                <>
                  <X className="w-4 h-4" />
                  Stop Demo
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Demo Mode
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
