export const VICTORY_SCORE = 1000;

export interface Player {
  id: string;
  name: string;
  score: number;
}

export enum DieStatus {
  // At the start of a turn, all dice are ready to be picked up and rolled.
  READY = 'ready',
  // When a player has dice in hand, they are in the process of rolling.
  IN_HAND = 'in_hand',
  // A rolling die is one that is in the air, or bouncing around.
  // Dice can move from RESTING to ROLLING when they are knocked by another die.
  ROLLING = 'rolling',
  // A resting die is one that has settled in the playfield.
  RESTING = 'resting',
  // A spaz die is one that is out of bounds.
  SPAZ = 'spaz',
  // Dice can only be held at the completion of a roll.
  HELD = 'held',
  // Scored dice are ones that were successfully held.
  SCORED = 'scored',
}

export interface DieState {
  id: string;
  value: number;
  status: DieStatus;
}

export enum TurnState {
  READY = 'ready',
  IN_PROGRESS = 'in_progress',
  COMPLETE = 'complete',
  BUSTED = 'busted',
  // We might not need spaz, because we can calculate from the dice states.
  // SPAZ = 'spaz',
}

export interface RollResult {
  dice: DieState[];
  // The points that were scored.
  // TODO: Consider if we need this state, because points can be calculated from the dice.
  points: number;
}

export interface GamePermissions {
  canAddPlayer: (name: string) => boolean;
  canStartGame: boolean;
  canStartTurn: boolean;
  canAdvancePlayer: boolean;
  canCompleteRoll: boolean;
  canThrowDie: boolean;
  canHoldDice: boolean;
  canBankPoints: boolean;
}

export interface GameState {
  players: Player[];
  round: number;
  currentPlayerIndex: number;
  points: number;
  level: number;
  dice: DieState[];
  rolls: RollResult[];
  winner: Player | null;

  turnState: TurnState;

  permissions: GamePermissions;
  updatePermissions: () => void;
  addPlayer: (id: string, name: string) => void;
  removePlayer: (id: string) => void;
  startGame: () => void;
  startPlayerTurn: () => void;
  startLevel: () => void;
  advancePlayer: () => void;
  bankPoints: () => void;
  startRolling: () => void;
  setDiceStatus: (ids: string[], status: DieStatus) => void;
  setDieValue: (id: string, value: number) => void;
  throwDie: () => void;
  toggleHold: (id: string) => void;
  completeRoll: () => void;
  resetDice: () => void;
  quitGame: () => void;
  checkForVictory: () => void;
}
