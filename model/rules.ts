import { DieState } from "./state";

function scoreForCount(count: number, value: number): number {
  const baseValue = value === 1 ? 1000 : 100 * value;
  switch (count) {
    case 3:
      return baseValue;
    case 4:
      return baseValue * 2;
    case 5:
      return baseValue * 5;
    default:
      return 0;
  }
}

export function pointsForDice(dice: DieState[]): { points: number, isValidHold: boolean } {
  let availableDice = [...dice];
  let points = 0;

  const values = dice.map(d => d.value).sort().join(',');
  const counts = dice.map(d => d.value).reduce((acc, value) => {
    acc[value]++;
    return acc;
    // We use an initial array of The 7 values.
    // A value of 0 means the die has not been thrown yet.
  }, [0, 0, 0, 0, 0, 0, 0] as number[]);

  // Is there a straight?
  if (values === '1,2,3,4,5' || values === '2,3,4,5,6') {
    // We can return because all dice are used.
    return { points: 1500, isValidHold: true };
  }

  // Is there a 3 of a kind, 4 of a kind, or 5 of a kind?
  counts.forEach((count, value) => {
    if (count >= 3) {
      points += scoreForCount(count, value);
      availableDice = availableDice.filter(d => d.value !== value);
    }
  });

  availableDice.forEach(d => {
    if (d.value === 1) {
      points += 100;
    } else if (d.value === 5) {
      points += 50;
    }
  });

  return { points, isValidHold: availableDice.length === 0 };
}

export function isBusted(dice: DieState[]): boolean {
  // If you hold all the dice, and you have no points, you are busted.
  return pointsForDice(dice).points === 0;
}
