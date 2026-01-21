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
  // Level 0 is a pre-turn state.
  level: 0,
  points: 0,
  permissions: {
    canAddPlayer: name => name.length > 0,
    canStartGame: false,
    canCompleteRoll: false,
    canThrowDie: false,
    canHoldDice: false,
    canBankPoints: false,
  },

  updatePermissions: () => {
    const { dice, round, currentPlayerIndex, players } = get();
    const diceInHand = dice.filter((die) => die.status === DieStatus.IN_HAND);
    const heldDice = dice.filter((die) => die.status === DieStatus.HELD);
    const rollingDice = dice.filter((die) => die.status === DieStatus.ROLLING);
    const restingDice = dice.filter((die) => die.status === DieStatus.RESTING);
    const spazDice = dice.filter((die) => die.status === DieStatus.SPAZ);
    const scoredDice = dice.filter((die) => die.status === DieStatus.SCORED);
    const readyDice = dice.filter((die) => die.status === DieStatus.READY);

    const { isValidHold, points } = pointsForDice(heldDice);

    console.log('updatePermissions', dice);

    set({
      permissions: {
        canAddPlayer: name => name.length > 0 && players.find((player) => player.name === name) === undefined,
        canStartGame: round === 0 && players.length > 0,
        canCompleteRoll: heldDice.length > 0 && isValidHold,
        canThrowDie: diceInHand.length > 0 && rollingDice.length === 0,
        canHoldDice: restingDice.length > 0 && diceInHand.length === 0 && rollingDice.length === 0,
        canBankPoints: points > 0 && round > 1,
      },
    });
  },

  // Pre-game actions. ----------------------------------------------------------
  addPlayer: (id: string, name: string) => {
    const { players, updatePermissions } = get();
    console.log('addPlayer', id, name);
    set({ players: [...players, { id, name, score: 0 }] });
    updatePermissions();
  },

  removePlayer: (id: string) => {
    const { players, updatePermissions } = get();
    console.log('removePlayer', id);
    set({ players: players.filter((player) => player.id !== id) });
    updatePermissions();
  },

  startGame: () => {
    const { startPlayerTurn, updatePermissions} = get();
    set({
      round: 1,
      currentPlayerIndex: 0,
    });
    updatePermissions();
    startPlayerTurn();
  },
  // ----------------------------------------------------------------------------

  startPlayerTurn: () => {
    const { startLevel, updatePermissions } = get();
    set({
      points: 0,
      level: 0,
    });
    updatePermissions();
    startLevel();
  },

  startLevel: () => {
    const { dice, level, startRolling, updatePermissions } = get();
    set({
      dice: dice.map((die) => ({ ...die, value: 0, status: DieStatus.READY })),
      level: level + 1,
      rolls: [],
    });
    updatePermissions();
    startRolling();
  },

  endPlayerTurn: () => {
    // Determnine if the game is complete.
    // If currentPlayerIndex is the last player, advance the next round.
    const { currentPlayerIndex, players, round, updatePermissions } = get();
    set({
      round: currentPlayerIndex === players.length - 1 ? round + 1 : round,
      currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
    });
    updatePermissions();
  },

  bankPoints: () => {
    const { currentPlayerIndex, players, points, updatePermissions } = get();
    set({
      players: players.map((player, index) => index === currentPlayerIndex ? { ...player, score: player.score + points } : player),
    });
    updatePermissions();
  },

  startRolling: () => {
    // When a player starts a roll, they pick up any ready dice, or dice that are not held.
    const { dice, updatePermissions } = get();
    set({
      dice: dice.map((die) => {
        if (die.status === DieStatus.READY || die.status === DieStatus.RESTING) {
          return { ...die, status: DieStatus.IN_HAND };
        }
        return die;
      })
    });
    updatePermissions();
  },

  // Bulk update the status of multiple dice.
  setDiceStatus: (ids: string[], status: DieStatus) => {
    const { dice, updatePermissions } = get();
    set({
      dice: dice.map((die) => ids.includes(die.id) ? { ...die, status } : die),
    });
    updatePermissions();
  },

  setDieValue: (id: string, value: number) => {
    const { dice } = get();
    set({
      dice: dice.map((die) => die.id === id ? { ...die, value } : die),
    });
  },

  throwDie: () => {
    const { dice, updatePermissions } = get();
    // Get the next die in hand.
    const nextDie = dice.find((die) => die.status === DieStatus.IN_HAND);
    // TODO: Consider throwing an error if !nextDie.

    set({
      dice: dice.map((die) => die.id === nextDie?.id ? { ...die, status: DieStatus.ROLLING} : die),
    });
    updatePermissions();
  },

  // We can hold multiple dice at once, and there are some cases where you must hold 3 or more dice.
  // But the UI will update on a per-die basis.
  toggleHold: (id: string) => {
    console.log('holdDie', id);
    const { dice, updatePermissions } = get();
    const isHeld = dice.find((die) => die.id === id)?.status === DieStatus.HELD;
    const newStatus = isHeld ? DieStatus.RESTING : DieStatus.HELD;
    set({
      dice: dice.map((die) => die.id === id ? { ...die, status: newStatus } : die),
    });
    updatePermissions();
  },

  completeRoll: () => {
    const { dice, points, rolls, updatePermissions } = get();
    const heldDice = dice.filter((die) => die.status === DieStatus.HELD);
    // Collect the held dice and calculate the points.
    const rollResult: RollResult = {
      dice: heldDice,
      points: pointsForDice(heldDice).points,
    };
    set({
      rolls: [...rolls, rollResult],
      dice: dice.map((die) => heldDice.includes(die) ? { ...die, status: DieStatus.SCORED } : die),
      points: points + rollResult.points,
    });
    updatePermissions();
  },

  resetDice: () => {
    const { dice, updatePermissions } = get();
    set({
      dice: dice.map((die) => ({ ...die, value: 0, status: DieStatus.READY })),
    });
    updatePermissions();
  },

  quitGame: () => {
    const { dice, updatePermissions } = get();
    set({
      round: 0,
      currentPlayerIndex: 0,
      level: 0,
      points: 0,
      players: [],
      dice: dice.map((die) => ({ ...die, status: DieStatus.READY })),
      rolls: [],
    });
    updatePermissions();
  },

}));

export default useGameStore;