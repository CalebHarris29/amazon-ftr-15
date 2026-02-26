import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DemoProvider } from '@/context/DemoContext';
import CustomerPortal from '@/pages/CustomerPortal';

/**
 * E2E smoke test: Simulates a customer submitting a return and asserts
 * that inspection reaches completion and a status is set.
 */
describe('E2E Smoke: Return submission flow', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const renderCustomerPortal = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <DemoProvider>
            <MemoryRouter initialEntries={['/customer']}>
              <Routes>
                <Route path="/customer" element={<CustomerPortal />} />
                <Route path="/inspection" element={<div data-testid="inspection-page">Inspection Page</div>} />
              </Routes>
            </MemoryRouter>
          </DemoProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  };

  it('submits return, simulation reaches completion, and status is set', { timeout: 15000 }, async () => {
    renderCustomerPortal();

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/enter your name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/ORD-123456/i), { target: { value: 'ORD-999888' } });
    fireEvent.change(screen.getByPlaceholderText(/iPhone 15 Pro/i), { target: { value: 'MacBook Pro' } });
    fireEvent.change(screen.getByLabelText(/reason for return/i), { target: { value: 'Item not as described' } });

    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit return request/i }));
    });

    // Wait for inspection stages to complete (5 × 1500ms = 7.5s)
    await waitFor(
      () => {
        expect(screen.getByText('Inspection Complete!')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Verify we can view results (button appears)
    expect(screen.getByRole('button', { name: /view inspection results/i })).toBeInTheDocument();

    // Verify a return was added to context (by checking the flow completed - the form is gone and results view is shown)
    expect(screen.queryByPlaceholderText(/enter your name/i)).not.toBeInTheDocument();
  });
});
