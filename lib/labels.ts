import { TurnState } from "@/model/state";

export const LevelLabels: Record<number, string> = {
  0: 'Pregame',
  1: 'Zonk',
  2: 'Vanna',
  3: 'Mitch',
  4: 'Three Mile Island',
  5: 'Chernobyl',
  6: 'Challenger',
  7: 'Hindenberg',
  8: 'Titanic',
  9: 'Fukushima',
};

export function getLevelLabel(level: number) {
  if (level in LevelLabels) {
    return LevelLabels[level];
  }
  return `Level ${level}`;
}

export function getTurnStateLabel(turnState: TurnState) {
  switch (turnState) {
    case TurnState.READY:
      return 'Ready';
    case TurnState.IN_PROGRESS:
      return 'In Progress';
    case TurnState.COMPLETE:
      return 'Complete';
    case TurnState.BUSTED:
      return 'Busted';
  }
}