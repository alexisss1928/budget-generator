export type InstallmentInitialType = 'amount' | 'percentage';

export interface BuildInstallmentPlanArgs {
  totalAmount: number;
  initialType: InstallmentInitialType;
  initialValue: string;
  installmentCount: number;
  baseDate: Date;
  procedureLabel: string;
  items?: { procedure: string; cost: number }[];
}

export interface InstallmentPlanEntry {
  date: string;
  cost: number;
  procedure: string;
  isPendingInstallment?: boolean;
  proceduresIncluded?: { procedure: string; cost: number }[];
}

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export function buildInstallmentPlan({
  totalAmount,
  initialType,
  initialValue,
  installmentCount,
  baseDate,
  procedureLabel,
  items,
}: BuildInstallmentPlanArgs): InstallmentPlanEntry[] {
  const total = Math.max(0, roundCurrency(totalAmount));
  const count = Math.max(1, Math.floor(installmentCount || 1));
  if (count <= 1 || total <= 0) {
    return [
      {
        date: baseDate.toISOString(),
        cost: total,
        procedure: procedureLabel,
        proceduresIncluded: items?.map((it) => ({
          procedure: it.procedure,
          cost: roundCurrency(it.cost),
        })),
      },
    ];
  }

  const parsedInitialValue = parseFloat(initialValue || '0');
  const initialAmount =
    initialType === 'percentage'
      ? roundCurrency(
          (total * (isNaN(parsedInitialValue) ? 0 : parsedInitialValue)) / 100,
        )
      : roundCurrency(isNaN(parsedInitialValue) ? 0 : parsedInitialValue);

  const safeInitialAmount = Math.min(Math.max(0, initialAmount), total);
  const remaining = roundCurrency(total - safeInitialAmount);
  const amounts: number[] = [];
  let remainingToDistribute = remaining;
  let remainingInstallments = count - 1;

  amounts[0] = safeInitialAmount;

  for (let index = 1; index < count; index += 1) {
    if (index === count - 1) {
      amounts[index] = roundCurrency(remainingToDistribute);
    } else {
      const share = roundCurrency(
        remainingToDistribute / remainingInstallments,
      );
      amounts[index] = share;
      remainingToDistribute = roundCurrency(remainingToDistribute - share);
      remainingInstallments -= 1;
    }
  }

  // Precompute item totals
  const itemTotals = (items || []).map((it) => ({
    procedure: it.procedure,
    cost: roundCurrency(it.cost),
  }));

  return amounts.map((cost, index) => {
    const installmentCost = roundCurrency(cost);

    // Distribute installmentCost proportionally to items
    const proceduresIncluded: { procedure: string; cost: number }[] = [];
    let remainingToAssign = installmentCost;
    for (let i = 0; i < itemTotals.length; i += 1) {
      const it = itemTotals[i];
      if (i === itemTotals.length - 1) {
        proceduresIncluded.push({
          procedure: it.procedure,
          cost: roundCurrency(remainingToAssign),
        });
      } else {
        const share = roundCurrency((it.cost / total) * installmentCost);
        proceduresIncluded.push({ procedure: it.procedure, cost: share });
        remainingToAssign = roundCurrency(remainingToAssign - share);
      }
    }

    return {
      date: new Date(baseDate.getTime() + index * 14 * 86400000).toISOString(),
      cost: installmentCost,
      procedure: `${procedureLabel} (cuota ${index + 1}/${count})`,
      isPendingInstallment: index > 0,
      proceduresIncluded,
    };
  });
}
