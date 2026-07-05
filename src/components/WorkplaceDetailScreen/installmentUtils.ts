export type InstallmentInitialType = 'amount' | 'percentage';

export interface BuildInstallmentPlanArgs {
  totalAmount: number;
  initialType: InstallmentInitialType;
  initialValue: string;
  installmentCount: number;
  baseDate: Date;
  procedureLabel: string;
}

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export function buildInstallmentPlan({
  totalAmount,
  initialType,
  initialValue,
  installmentCount,
  baseDate,
  procedureLabel,
}: BuildInstallmentPlanArgs) {
  const total = Math.max(0, roundCurrency(totalAmount));
  const count = Math.max(1, Math.floor(installmentCount || 1));
  if (count <= 1 || total <= 0) {
    return [
      {
        date: baseDate.toISOString(),
        cost: total,
        procedure: procedureLabel,
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

  return amounts.map((cost, index) => ({
    date: new Date(baseDate.getTime() + index * 14 * 86400000).toISOString(),
    cost: roundCurrency(cost),
    procedure: `${procedureLabel} (cuota ${index + 1}/${count})`,
  }));
}
