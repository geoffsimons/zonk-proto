import { DieStatus } from "@/model/state";
import useGameStore from "@/model/useGameStore";
import { Button } from "react-native";
import { showConfirmDialog } from "./ConfirmDialog";

export function StartNewGameButton() {
  // We use the quitGame action to reset the game state and start a new game.
  const { quitGame, winner } = useGameStore();
  // There needs to be a winner to start a new game.
  if (!winner) {
    return null;
  }
  return (
    <Button title="Reset and Start New Game" onPress={quitGame} />
  );
}

export function RematchButton() {
  const { startGame, winner } = useGameStore();
  // There needs to be a winner to start a new game.
  if (!winner) {
    return null;
  }
  return (
    <Button title="Rematch" onPress={startGame} />
  );
}

export function QuitGameButton() {
  const { quitGame, winner } = useGameStore();

  if (winner) {
    return null;
  }

  const handleQuitPress = () => {
    showConfirmDialog({
      title: 'Quit Game',
      message: 'Are you sure you want to quit the game?',
      confirmText: 'Quit',
      cancelText: 'Cancel',
      onConfirm: quitGame,
    });
  };

  return (
    <Button title="Quit Game" onPress={handleQuitPress} />
  );
}

export function StartTurnButton() {
  const { advancePlayer, permissions } = useGameStore();
  if (!permissions.canAdvancePlayer) {
    return null;
  }
  return (
    <Button title="Next Player" onPress={advancePlayer} />
  );
}

export function BankPointsButton() {
  const { bankPoints, permissions } = useGameStore();
  if (!permissions.canBankPoints) {
    return null;
  }
  return (
    <Button title="Bank Points" onPress={bankPoints} />
  );
}

export function KeepDiceButton() {
  const { dice, completeRoll, permissions } = useGameStore();

  if (!permissions.canCompleteRoll) {
    return null;
  }

  // How many dice are still resting after holds.
  const restingDice = dice.filter((die) => die.status === DieStatus.RESTING);
  const numResting = restingDice.length > 0 ? restingDice.length : 5;
  return (
    <Button title={`Roll ${numResting} Dice`} onPress={completeRoll} disabled={!permissions.canCompleteRoll} />
  );
}

export function ThrowDieButton() {
  const { throwDie, permissions } = useGameStore();
  if (!permissions.canThrowDie) {
    return null;
  }

  return (
    <Button title="Throw Die" onPress={throwDie} />
  );
}

