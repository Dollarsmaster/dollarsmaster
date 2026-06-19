'use client';

import { Button } from '@/components/ui/button';
import {
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatContractType } from '@/lib/contract-utils';
import { getSymbolDisplayName } from '@/lib/active-symbols-display-names';
import { ProfitCell } from './profit-cell';
import type { OpenPosition } from '@/hooks/use-open-positions';
import type { ClosedPosition } from '@/hooks/use-closed-positions';

interface OpenPositionRowProps {
  pos: OpenPosition;
  isSelling: boolean;
  onSell: (contractId: number, bidPrice: string) => Promise<void>;
  contractTypeLabels: Record<string, string>;
}

interface ClosedPositionRowProps {
  pos: ClosedPosition;
  contractTypeLabels: Record<string, string>;
}

export function OpenPositionRow({
  pos,
  isSelling,
  onSell,
  contractTypeLabels,
}: OpenPositionRowProps) {
  const profit = parseFloat(pos.profit);
  const bidPrice = parseFloat(pos.bid_price);
  const buyPrice = parseFloat(pos.buy_price);
  const profitPct = parseFloat(pos.profit_percentage);

  return (
    <TableRow>
      <TableCell className="font-medium">
        {formatContractType(pos.contract_type, contractTypeLabels, pos.barrier)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {getSymbolDisplayName(pos.underlying_symbol)}
      </TableCell>
      <TableCell className="text-right">
        {buyPrice.toFixed(2)} {pos.currency}
      </TableCell>
      <TableCell className="text-right">
        {bidPrice.toFixed(2)} {pos.currency}
      </TableCell>
      <ProfitCell 
        profit={profit} 
        profitPct={profitPct} 
        currency={pos.currency} 
      />
      <TableCell className="text-right">
        <Button
          size="sm"
          variant="outline"
          disabled={isSelling || pos.is_valid_to_sell !== 1}
          onClick={() => onSell(pos.contract_id, pos.bid_price)}
          aria-label={`Sell ${getSymbolDisplayName(pos.underlying_symbol)} position`}
        >
          {isSelling ? 'Selling...' : 'Sell'}
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function ClosedPositionRow({
  pos,
  contractTypeLabels,
}: ClosedPositionRowProps) {
  const profit = pos.sell_price - pos.buy_price;
  const profitPct = (profit / pos.buy_price) * 100;

  return (
    <TableRow>
      <TableCell className="font-medium">
        {formatContractType(pos.contract_type, contractTypeLabels)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {getSymbolDisplayName(pos.underlying_symbol)}
      </TableCell>
      <TableCell className="text-right">
        {pos.buy_price.toFixed(2)}
      </TableCell>
      <TableCell className="text-right">
        {pos.sell_price.toFixed(2)}
      </TableCell>
      <ProfitCell 
        profit={profit} 
        profitPct={profitPct}
      />
      <TableCell />
    </TableRow>
  );
}
