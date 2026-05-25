const BASE_WINNING_SLOTS = 4;
const BASE_LOSING_SLOTS = 2;
const MAX_LOSING_SLOTS = 12;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export interface DepWheelSegment {
  index: number;
  isWin: boolean;
  startAngle: number;
  endAngle: number;
  centerAngle: number;
}

export interface DepWheelConfig {
  totalSlots: number;
  winningSlots: number;
  losingSlots: number;
  winChance: number;
  segments: DepWheelSegment[];
}

const getBalanceShare = (bet: number, balanceBeforeBet: number) => {
  if (!Number.isFinite(bet) || !Number.isFinite(balanceBeforeBet) || bet <= 0 || balanceBeforeBet <= 0) {
    return 0;
  }

  return clamp(bet / balanceBeforeBet, 0, 1);
};

function calculateRedSlotBonus(bet: number) {
  if (!Number.isFinite(bet) || bet < 100) {
    return 0;
  }

  return Math.floor(Math.log10(bet)) - 1;
}

export function calculateDepWheelConfig(bet: number, _balanceBeforeBet: number): DepWheelConfig {
  const losingSlots = clamp(
    BASE_LOSING_SLOTS + calculateRedSlotBonus(bet),
    BASE_LOSING_SLOTS,
    MAX_LOSING_SLOTS
  );
  const winningSlots = BASE_WINNING_SLOTS;
  const totalSlots = winningSlots + losingSlots;
  const slotAngle = 360 / totalSlots;
  const winEvery = totalSlots / winningSlots;
  const winIndexes = new Set<number>();

  for (let i = 0; i < winningSlots; i += 1) {
    winIndexes.add(Math.floor(i * winEvery));
  }

  const segments = Array.from({ length: totalSlots }, (_, index) => {
    const startAngle = index * slotAngle;
    const endAngle = startAngle + slotAngle;

    return {
      index,
      isWin: winIndexes.has(index),
      startAngle,
      endAngle,
      centerAngle: startAngle + slotAngle / 2,
    };
  });

  return {
    totalSlots,
    winningSlots,
    losingSlots,
    winChance: winningSlots / totalSlots,
    segments,
  };
}

export function calculateDepWinChance(bet: number, balanceBeforeBet: number) {
  return calculateDepWheelConfig(bet, balanceBeforeBet).winChance;
}

export function getDepResultSegment(config: DepWheelConfig, isWin: boolean) {
  const matchingSegments = config.segments.filter(segment => segment.isWin === isWin);
  return matchingSegments[Math.floor(Math.random() * matchingSegments.length)] || config.segments[0];
}

export function calculateDepRatingPenalty(bet: number, balanceBeforeBet: number) {
  if (!Number.isFinite(bet) || !Number.isFinite(balanceBeforeBet) || bet <= 0 || balanceBeforeBet <= 0) {
    return 0;
  }

  const balanceShare = getBalanceShare(bet, balanceBeforeBet);
  const amountPressure = Math.ceil(Math.log10(bet + 1) * 3);
  const riskPressure = Math.ceil(balanceShare * 35);

  return clamp(4 + amountPressure + riskPressure, 1, 75);
}
