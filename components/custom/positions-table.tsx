'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { OpenPositionRow, ClosedPositionRow } from './positions-table-rows';
import { OpenPositionCard } from './open-position-card';
import { ClosedPositionCard } from './closed-position-card';
import type { OpenPosition } from '@/hooks/use-open-positions';
import type { ClosedPosition } from '@/hooks/use-closed-positions';

export enum PositionFilterType {
  Open = 'open',
  Closed = 'closed',
  All = 'all',
}

export type PositionFilter = 'open' | 'closed' | 'all';

interface PositionsTableProps {
  openPositions: OpenPosition[];
  closedPositions: ClosedPosition[];
  onSell: (contractId: number, bidPrice: string) => Promise<void>;
  sellingId: number | null;
  sellError: string | null;
  onClearSellError: () => void;
  /** Map from contract_type string to display label. Falls back to raw type. */
  contractTypeLabels?: Record<string, string>;
  /** Merged onto the root wrapper (spacing, max-height, overflow). */
  className?: string;
}

const VALUE_COL_HEADER: Record<PositionFilter, string> = {
  open: 'Current Value',
  closed: 'Sell Price',
  all: 'Value',
};

export function PositionsTable({
  openPositions,
  closedPositions,
  onSell,
  sellingId,
  sellError,
  onClearSellError,
  contractTypeLabels = {},
  className,
}: PositionsTableProps) {
  const [filter, setFilter] = useState<PositionFilter>('open');

  // Show error toast when sell fails
  useEffect(() => {
    if (sellError) {
      toast.error('Sell Failed', { description: sellError });
      onClearSellError();
    }
  }, [sellError, onClearSellError]);

  // Memoize filtered positions to avoid unnecessary recalculations
  const visibleOpen = useMemo(
    () => (filter === 'open' || filter === 'all' ? openPositions : []),
    [filter, openPositions]
  );

  const visibleClosed = useMemo(
    () => (filter === 'closed' || filter === 'all' ? closedPositions : []),
    [filter, closedPositions]
  );

  const totalCount = openPositions.length + closedPositions.length;
  const hasPositions = visibleOpen.length > 0 || visibleClosed.length > 0;

  return (
    <div className={cn('mt-6', className)}>
      {/* Header with title and filter */}
      <div className="grid grid-cols-3 items-center mb-3">
        <div />
        <h2 className="text-sm font-semibold text-center">Report</h2>
        <Select 
          value={filter} 
          onValueChange={(value) => setFilter(value as PositionFilter)}
        >
          <SelectTrigger 
            className="w-28 ml-auto"
            aria-label="Filter positions by status"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PositionFilterType.Open}>
              Open ({openPositions.length})
            </SelectItem>
            <SelectItem value={PositionFilterType.Closed}>
              Closed ({closedPositions.length})
            </SelectItem>
            <SelectItem value={PositionFilterType.All}>
              All ({totalCount})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Table View */}
      <div className="hidden lg:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Stake</TableHead>
              <TableHead className="text-right">{VALUE_COL_HEADER[filter]}</TableHead>
              <TableHead className="text-right">P&amp;L</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleOpen.map((pos) => (
              <OpenPositionRow
                key={`open-${pos.contract_id}`}
                pos={pos}
                isSelling={sellingId === pos.contract_id}
                onSell={onSell}
                contractTypeLabels={contractTypeLabels}
              />
            ))}
            {visibleClosed.map((pos) => (
              <ClosedPositionRow
                key={`closed-${pos.contract_id}`}
                pos={pos}
                contractTypeLabels={contractTypeLabels}
              />
            ))}
            {!hasPositions && (
              <TableRow>
                <TableCell 
                  colSpan={6} 
                  className="text-center text-sm text-muted-foreground py-8"
                >
                  No positions
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: Card View */}
      <div className="lg:hidden flex flex-col gap-3">
        {visibleOpen.map((pos) => (
          <OpenPositionCard
            key={`open-card-${pos.contract_id}`}
            pos={pos}
            isSelling={sellingId === pos.contract_id}
            onSell={onSell}
            contractTypeLabels={contractTypeLabels}
          />
        ))}
        {visibleClosed.map((pos) => (
          <ClosedPositionCard
            key={`closed-card-${pos.contract_id}`}
            pos={pos}
            contractTypeLabels={contractTypeLabels}
          />
        ))}
        {!hasPositions && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No positions
          </p>
        )}
      </div>
    </div>
  );
}
