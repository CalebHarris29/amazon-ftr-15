import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { DemoProvider, useDemo } from './DemoContext';

// Wrapper component to read and expose context values for testing
function TestConsumer({
  onContext,
}: {
  onContext: (context: ReturnType<typeof useDemo>) => void;
}) {
  const context = useDemo();
  onContext(context);
  return <div data-testid="consumer">Consumer</div>;
}

function DemoTestWrapper({
  children,
  onContext,
}: {
  children: React.ReactNode;
  onContext: (context: ReturnType<typeof useDemo>) => void;
}) {
  return (
    <DemoProvider>
      <TestConsumer onContext={onContext} />
      {children}
    </DemoProvider>
  );
}

describe('DemoContext', () => {
  describe('addReturn', () => {
    it('adds a new return with id, fraudScore, status pending, inspectionStage 0, expiresAt ~72h in future', async () => {
      let capturedContext: ReturnType<typeof useDemo> | null = null;

      render(
        <DemoTestWrapper
          onContext={(ctx) => {
            capturedContext = ctx;
          }}
        >
          <></>
        </DemoTestWrapper>
      );

      await act(async () => {
        capturedContext!.addReturn({
          customerName: 'Test User',
          orderId: 'ORD-123456',
          itemName: 'iPhone 15',
          reason: 'Item not as described',
          returnType: 'refund',
          submittedAt: new Date(),
        });
      });

      expect(capturedContext!.returns).toHaveLength(1);
      const added = capturedContext!.returns[0];

      expect(added.id).toMatch(/^RET-\d{4}$/);
      expect(added.fraudScore).toBeGreaterThanOrEqual(1);
      expect(added.fraudScore).toBeLessThanOrEqual(100);
      expect(added.status).toBe('pending');
      expect(added.inspectionStage).toBe(0);

      const now = Date.now();
      const expectedMin = now + 71 * 60 * 60 * 1000;
      const expectedMax = now + 73 * 60 * 60 * 1000;
      expect(added.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin);
      expect(added.expiresAt.getTime()).toBeLessThanOrEqual(expectedMax);

      expect(added.customerName).toBe('Test User');
      expect(added.orderId).toBe('ORD-123456');
      expect(added.itemName).toBe('iPhone 15');
      expect(added.reason).toBe('Item not as described');
      expect(added.returnType).toBe('refund');
    });
  });

  describe('updateReturn', () => {
    it('updates only the targeted return', async () => {
      let capturedContext: ReturnType<typeof useDemo> | null = null;

      render(
        <DemoTestWrapper
          onContext={(ctx) => {
            capturedContext = ctx;
          }}
        >
          <></>
        </DemoTestWrapper>
      );

      let addedId: string;

      await act(async () => {
        const r = capturedContext!.addReturn({
          customerName: 'User A',
          orderId: 'ORD-001',
          itemName: 'Item A',
          reason: 'Damaged',
          returnType: 'refund',
          submittedAt: new Date(),
        });
        addedId = r.id;
      });

      await act(async () => {
        capturedContext!.addReturn({
          customerName: 'User B',
          orderId: 'ORD-002',
          itemName: 'Item B',
          reason: 'Wrong item',
          returnType: 'replacement',
          submittedAt: new Date(),
        });
      });

      expect(capturedContext!.returns).toHaveLength(2);

      await act(async () => {
        capturedContext!.updateReturn(addedId!, { notes: 'Updated note' });
      });

      const updated = capturedContext!.returns.find((r) => r.id === addedId);
      const other = capturedContext!.returns.find((r) => r.id !== addedId);

      expect(updated!.notes).toBe('Updated note');
      expect(other!.notes).toBeUndefined();
    });

    it('keeps activeInspection in sync when updating the active item', async () => {
      let capturedContext: ReturnType<typeof useDemo> | null = null;

      render(
        <DemoTestWrapper
          onContext={(ctx) => {
            capturedContext = ctx;
          }}
        >
          <></>
        </DemoTestWrapper>
      );

      let addedId: string;

      await act(async () => {
        const r = capturedContext!.addReturn({
          customerName: 'User',
          orderId: 'ORD-001',
          itemName: 'Item',
          reason: 'Damaged',
          returnType: 'refund',
          submittedAt: new Date(),
        });
        addedId = r.id;
        capturedContext!.setActiveInspection(r);
      });

      expect(capturedContext!.activeInspection?.id).toBe(addedId);

      await act(async () => {
        capturedContext!.updateReturn(addedId!, {
          notes: 'Inspector note',
          inspectionStage: 1,
        });
      });

      expect(capturedContext!.activeInspection?.notes).toBe('Inspector note');
      expect(capturedContext!.activeInspection?.inspectionStage).toBe(1);
    });
  });

  describe('advanceInspectionStage', () => {
    it('increments inspectionStage until 5', async () => {
      let capturedContext: ReturnType<typeof useDemo> | null = null;

      render(
        <DemoTestWrapper
          onContext={(ctx) => {
            capturedContext = ctx;
          }}
        >
          <></>
        </DemoTestWrapper>
      );

      await act(async () => {
        const r = capturedContext!.addReturn({
          customerName: 'User',
          orderId: 'ORD-001',
          itemName: 'Item',
          reason: 'Damaged',
          returnType: 'refund',
          submittedAt: new Date(),
        });
        capturedContext!.setActiveInspection(r);
      });

      const fraudScore = capturedContext!.activeInspection!.fraudScore;

      // Advance from 0 -> 1 -> 2 -> 3 -> 4 -> 5 (inspecting) -> final status
      for (let i = 0; i < 6; i++) {
        await act(async () => {
          capturedContext!.advanceInspectionStage();
        });
      }

      const updated = capturedContext!.returns[0];
      expect(updated.inspectionStage).toBe(5);
      const expectedStatus =
        fraudScore > 90
          ? 'rejected'
          : fraudScore > 70
            ? 'flagged'
            : 'approved';
      expect(updated.status).toBe(expectedStatus);
    });

    it('does nothing when no active inspection', async () => {
      let capturedContext: ReturnType<typeof useDemo> | null = null;

      render(
        <DemoTestWrapper
          onContext={(ctx) => {
            capturedContext = ctx;
          }}
        >
          <></>
        </DemoTestWrapper>
      );

      await act(async () => {
        capturedContext!.addReturn({
          customerName: 'User',
          orderId: 'ORD-001',
          itemName: 'Item',
          reason: 'Damaged',
          returnType: 'refund',
          submittedAt: new Date(),
        });
        // Do NOT set active inspection
      });

      const before = capturedContext!.returns[0];

      await act(async () => {
        capturedContext!.advanceInspectionStage();
      });

      const after = capturedContext!.returns[0];
      expect(after.inspectionStage).toBe(before.inspectionStage);
      expect(after.status).toBe(before.status);
    });
  });
});
