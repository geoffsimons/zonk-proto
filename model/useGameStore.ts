import { create } from 'zustand';
import { isBusted, pointsForDice } from './rules';
import { DieStatus, GameState, RollResult, TurnState, VICTORY_SCORE } from './state';

const useGameStore = create<GameState>((set, get) => ({
  players: [],
  // Round 0 is the pregame round where players can be added and removed.
  round: 0,
  dice: ['die-1', 'die-2', 'die-3', 'die-4', 'die-5'].map((id) => ({ id, value: 0, status: DieStatus.READY })),
  rolls: [] as RollResult[],
  // -1 means we have not started yet.
  currentPlayerIndex: -1,
  winner: null,
  // Level 0 is a pre-turn state.
  level: 0,
  points: 0,
  turnState: TurnState.READY,
  permissions: {
    canAddPlayer: name => name.length > 0,
    canStartGame: false,
    canStartTurn: false,
    canCompleteRoll: false,
    canThrowDie: false,
    canHoldDice: false,
    canBankPoints: false,
    canAdvancePlayer: false,
  },

  updatePermissions: () => {
    const { dice, round, turnState, players, winner } = get();
    const diceInHand = dice.filter((die) => die.status === DieStatus.IN_HAND);
    const heldDice = dice.filter((die) => die.status === DieStatus.HELD);
    const rollingDice = dice.filter((die) => die.status === DieStatus.ROLLING);
    const restingDice = dice.filter((die) => die.status === DieStatus.RESTING);

    const activeDice = [...heldDice, ...restingDice];

    const { isValidHold, points: heldPoints } = pointsForDice(heldDice);
    const { points: activePoints } = pointsForDice(activeDice);

    console.log('updatePermissions dice:', dice);
    // console.log('heldDice', heldDice);
    // console.log('isValidHold', isValidHold);
    console.log('activeDice', activeDice);
    console.log('heldPoints', heldPoints);
    console.log('activePoints', activePoints);

    const isRollComplete = diceInHand.length === 0 && rollingDice.length === 0;

    set({
      permissions: {
        canAddPlayer: name => name.length > 0 && players.find((player) => player.name === name) === undefined,
        canStartGame: !winner || (round === 0 && players.length > 0),
        canStartTurn: !winner && turnState !== TurnState.IN_PROGRESS,
        canCompleteRoll: turnState === TurnState.IN_PROGRESS && heldDice.length > 0 && isValidHold,
        canThrowDie: turnState === TurnState.IN_PROGRESS && diceInHand.length > 0 && rollingDice.length === 0,
        canHoldDice: turnState === TurnState.IN_PROGRESS && restingDice.length > 0 && isRollComplete,
        canBankPoints: turnState === TurnState.IN_PROGRESS && activePoints > 0 && isRollComplete,
        canAdvancePlayer: !winner && (turnState === TurnState.COMPLETE || turnState === TurnState.BUSTED),
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
    const { players, startPlayerTurn, updatePermissions} = get();
    set({
      round: 1,
      currentPlayerIndex: 0,
      players: players.map((player) => ({ ...player, score: 0 })),
      winner: null,
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
      turnState: TurnState.IN_PROGRESS,
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

  advancePlayer: () => {
    const { currentPlayerIndex, players, round, startPlayerTurn, updatePermissions } = get();
    set({
      currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
      round: currentPlayerIndex === players.length - 1 ? round + 1 : round,
    });
    updatePermissions();
    startPlayerTurn();
  },

  bankPoints: () => {
    const { dice, currentPlayerIndex, players, points, updatePermissions, checkForVictory } = get();
    console.log('bankPoints', currentPlayerIndex, players[currentPlayerIndex].score);

    // Calculate points from current roll.
    const activeDice = dice.filter((die) => die.status === DieStatus.RESTING || die.status === DieStatus.HELD);
    const rollPoints = pointsForDice(activeDice).points;
    const newScore = players[currentPlayerIndex].score + points + rollPoints;
    set({
      players: players.map((player, index) => index === currentPlayerIndex ? { ...player, score: newScore } : player),
      points: points + rollPoints,
      turnState: TurnState.COMPLETE,
    });
    updatePermissions();
    checkForVictory();
  },

  checkForVictory: () => {
    const { currentPlayerIndex, players, updatePermissions } = get();
    let winner = null;
    if (currentPlayerIndex === players.length - 1) {
      console.log('Checking for victory...', players);
      // Check for victory.
      let highIndex = 0;
      let highScore = 0;
      for (let i = 0; i < players.length; i++) {
        if (players[i].score > highScore) {
          highScore = players[i].score;
          highIndex = i;
        }
      }
      if (highScore >= VICTORY_SCORE) {
        winner = players[highIndex];
      }
      console.log('highIndex', highIndex);
      console.log('highScore', highScore);
      console.log('Victory check complete. Winner:', winner);
    }
    set({ winner: winner });
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
    const { dice, turnState, updatePermissions, checkForVictory } = get();
    const newDice = dice.map((die) => ids.includes(die.id) ? { ...die, status } : die);

    console.log('setDiceStatus newDice:', newDice);

    // If there are no dice in hand, and all dice are resting, check if the player is busted.
    const diceInHand = newDice.filter((die) => die.status === DieStatus.IN_HAND);
    const rollingDice = newDice.filter((die) => die.status === DieStatus.ROLLING);
    const restingDice = newDice.filter((die) => die.status === DieStatus.RESTING);
    const playerBusted = diceInHand.length === 0 && rollingDice.length === 0 && isBusted(restingDice);

    console.log('setDiceStatus playerBusted:', playerBusted);

    set({
      dice: newDice,
      turnState: playerBusted ? TurnState.BUSTED : turnState,
    });
    updatePermissions();
    if (playerBusted) {
      checkForVictory();
    }
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
    const { dice, points, rolls, startLevel, startRolling, updatePermissions } = get();
    const heldDice = dice.filter((die) => die.status === DieStatus.HELD);
    const restingDice = dice.filter((die) => die.status === DieStatus.RESTING);
    // Collect the held dice and calculate the points.
    const rollResult: RollResult = {
      dice: heldDice,
      points: pointsForDice(heldDice).points,
    };

    // Does this roll complete a level?
    const isLevelComplete = restingDice.length === 0;

    set({
      rolls: [...rolls, rollResult],
      dice: dice.map((die) => heldDice.includes(die) ? { ...die, status: DieStatus.SCORED } : die),
      points: points + rollResult.points,
    });
    updatePermissions();
    if (isLevelComplete) {
      startLevel();
    } else {
      startRolling();
    }
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