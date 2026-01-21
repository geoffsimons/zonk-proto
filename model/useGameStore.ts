import { create } from 'zustand';
import { pointsForDice } from './rules';
import { DieStatus, GameState, RollResult } from './state';

const useGameStore = create<GameState>((set, get) => ({
  players: [],
  // Round 0 is the pregame round where players can be added and removed.
  round: 0,
  dice: ['die-1', 'die-2', 'die-3', 'die-4', 'die-5'].map((id) => ({ id, value: 0, status: DieStatus.READY })),
  rolls: [] as RollResult[],
  currentPlayerIndex: 0,
  level: 1,
  points: 0,

  getActions: () => {
    const { dice, round, currentPlayerIndex, players } = get();
    const diceInHand = dice.filter((die) => die.status === DieStatus.IN_HAND);
    const heldDice = dice.filter((die) => die.status === DieStatus.HELD);
    const rollingDice = dice.filter((die) => die.status === DieStatus.ROLLING);
    const restingDice = dice.filter((die) => die.status === DieStatus.RESTING);
    const spazDice = dice.filter((die) => die.status === DieStatus.SPAZ);
    const scoredDice = dice.filter((die) => die.status === DieStatus.SCORED);
    const readyDice = dice.filter((die) => die.status === DieStatus.READY);
    const activeDice = dice.filter((die) => die.status !== DieStatus.SCORED);

    const { isValidHold, points } = pointsForDice(heldDice);
    return {
      canAddPlayer: round === 0,
      canRemovePlayer: round === 0 && players.length > 0,
      canStartGame: round === 0 && players.length > 0,
      canCompleteRoll: heldDice.length > 0 && isValidHold,
      canThrowDie: diceInHand.length > 0 && rollingDice.length === 0,
      canHoldDice: restingDice.length > 0 && restingDice.length === activeDice.length,
      canBankPoints: points > 0 && round > 1,
    };
  },

  addPlayer: (id: string, name: string) => {
    set({ players: [...get().players, { id, name, score: 0 }] });
  },

  removePlayer: (id: string) => {
    set({ players: get().players.filter((player) => player.id !== id) });
  },

  startPlayerTurn: () => {
    set({
      dice: get().dice.map((die) => ({ ...die, value: 0, status: DieStatus.READY })),
      points: 0,
      level: 1,
    });
  },

  endPlayerTurn: () => {
    // Determnine if the game is complete.
    // If currentPlayerIndex is the last player, advance the next round.
  },

  bankPoints: () => {
    const { currentPlayerIndex, players, points, round } = get();
    set({
      players: players.map((player, index) => index === currentPlayerIndex ? { ...player, score: player.score + points } : player),
      points: 0,
      level: 1,
      round: currentPlayerIndex === players.length - 1 ? round + 1 : round,
      currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
      dice: get().dice.map((die) => ({ ...die, value: 0, status: DieStatus.READY })),
      rolls: [],
    });
  },

  rollDice: () => {
    // When a player starts a roll, they pick up any ready dice, or dice that are not held.
    set({
      dice: get().dice.map((die) => {
        if (die.status === DieStatus.READY || die.status === DieStatus.RESTING) {
          return { ...die, status: DieStatus.IN_HAND };
        }
        return die;
      })
    });
  },

  //TODO: Consider if we just want a generic setDieStatus function.
  setDieRolling: (id: string) => {
    set({
      dice: get().dice.map((die) => die.id === id ? { ...die, status: DieStatus.ROLLING } : die),
    })
  },

  // We can hold multiple dice at once, and there are some cases where you must hold 3 or more dice.
  holdDie: (id: string) => {
    set({
      dice: get().dice.map((die) => die.id === id ? { ...die, status: DieStatus.HELD } : die),
    })
  },

  completeRoll: () => {
    const { dice, points } = get();
    const heldDice = dice.filter((die) => die.status === DieStatus.HELD);
    // Collect the held dice and calculate the points.
    const rollResult: RollResult = {
      dice: heldDice,
      points: pointsForDice(heldDice).points,
    };
    set({
      rolls: [...get().rolls, rollResult],
      dice: dice.map((die) => heldDice.includes(die) ? { ...die, status: DieStatus.SCORED } : die),
      points: points + rollResult.points,
    });
  },

  restDice: (ids: string[]) => {
    set({
      dice: get().dice.map((die) => ids.includes(die.id) ? { ...die, status: DieStatus.RESTING } : die),
    })
  },

  spazDice: (ids: string[]) => {
    set({
      dice: get().dice.map((die) => ids.includes(die.id) ? { ...die, status: DieStatus.SPAZ } : die),
    })
  },

  resetDice: () => {
    set({
      dice: get().dice.map((die) => ({ ...die, value: 0, status: DieStatus.IN_HAND })),
    })
  },

}));

export default useGameStore;