/**
 * This page is to prototype the gameplay of zonk. The goals are:
 * - Define the state of the game, which we will then refactor into a separate file.
 * - Define the rules of the game, which in turn define what actions are available to the player.
 * - Define the scoring system.
 * - Explore game rule variations, and how we can offer those as settings of the game.
 * - Simulate multi-player games (as a pass and play mode on the single app...for now)
 */

import useGameStore from '@/model/useGameStore';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { showConfirmDialog } from '@/components/ConfirmDialog';
import { getDotsForNumber } from '@/components/Die';
import IconButton from '@/components/IconButton';
import { pointsForDice } from '@/model/rules';
import { DieStatus, RollResult } from '@/model/state';
import { nanoid } from 'nanoid';
import Svg, { Circle, Rect } from 'react-native-svg';

function Scoreboard() {
  const { currentPlayerIndex,players } = useGameStore();
  return (
    <View style={styles.scoreboard}>
      {players.map((player, index) => (
        <View style={[styles.player, index === currentPlayerIndex ? styles.currentPlayer : '']} key={player.id}>
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.score}>{player.score}</Text>
        </View>
      ))}
    </View>
  );
}

function TurnStatus() {
  const { dice, turnState, currentPlayerIndex, players, points, level } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];
  const diceInHand = dice.filter((die) => die.status === DieStatus.IN_HAND);
  const activeDice = dice.filter((die) => die.status === DieStatus.HELD || die.status === DieStatus.RESTING);
  const { points: activePoints } = pointsForDice(activeDice);
  return (
    <View style={styles.turnStatus}>
      <Text style={styles.text}>Player {currentPlayer.name}: {turnState}</Text>
      <Text style={styles.text}>Level {level}</Text>
      <Text style={styles.text}>Points: {points} Active: {activePoints}</Text>
      <Text style={styles.text}>{diceInHand.length} dice in hand</Text>
    </View>
  );
}

function AddPlayerForm() {
  const { addPlayer, permissions } = useGameStore();
  const [name, setName] = useState('');

  const handleAddPlayer = () => {
    addPlayer(nanoid(), name);
    setName('');
  };

  const isPlayerNameValid = permissions.canAddPlayer(name);

  return (
    <>
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
        </View>
        <Button title="Add Player" disabled={!isPlayerNameValid} onPress={handleAddPlayer} />
      </View>
    </>
  );
}

function PlayerList() {
  const { players, removePlayer } = useGameStore();
  return (
    <>
      <Text style={styles.text}>Player List</Text>
      {players.map((player) => (
        <View style={styles.playerRow} key={player.id}>
          <Text style={styles.name}>{player.name}</Text>
          <IconButton
            name="close"
            onPress={() => removePlayer(player.id)}
            color="#ff4444"
            size={24}
          />
        </View>
      ))}
    </>
  );
}

function QuitGameButton() {
  const { quitGame } = useGameStore();

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

function PreGame() {
  const { permissions, round, startGame } = useGameStore();

  if (round === 0) {
    return (
      <View style={styles.container}>
        <AddPlayerForm />
        <PlayerList />
        <Button title="Start Game" disabled={!permissions.canStartGame} onPress={startGame} />
      </View>
    );
  }
  return null;
}

function Die2D({ id, value, size, isHeld = false, onHold }: { id: string, value: number, size: number, isHeld?: boolean, onHold?: (id: string) => void }) {
  const dots = getDotsForNumber(value);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} onPress={() => onHold?.(id)}>
      <Rect
        key={`rect-${id}-held`}
        x={0}
        y={0}
        width={size}
        height={size}
        fill="yellow"
        opacity={isHeld ? 1 : 0}
      />
      <Rect
        key={`rect-${id}`}
        x={size * 0.05}
        y={size * 0.05}
        width={size - size * 0.1}
        height={size - size * 0.1}
        fill="white"
      />
      {dots.map((dot, index) => (
        <Circle key={`dot-${id}-${index}`} cx={size / 2 - dot[0] * size} cy={size / 2 - dot[1] * size} r={size * 0.1} fill="black" />
      ))}
    </Svg>
  );
}

function RollingSimulator() {
  const { dice, setDiceStatus, setDieValue } = useGameStore();

  useEffect(() => {
    const rollingDice = dice.filter((die) => die.status === DieStatus.ROLLING);

    if (rollingDice.length > 0) {
      rollingDice.forEach((die) => {
        const newVal = Math.floor(Math.random() * 6) + 1;
        setDieValue(die.id, newVal);
        setDiceStatus([die.id], DieStatus.RESTING);
      });
    }
  }, [dice, setDieValue, setDiceStatus]);

  return (
    <></>
  );
}

function ThrowDieButton() {
  const { throwDie } = useGameStore();

  return (
    <Button title="Throw Die" onPress={throwDie} />
  );
}

function RollResultView({ key, roll }: { key: string, roll: RollResult }) {
  return (
    <View key={key} style={styles.rollResult}>
      {roll.dice.map((die) => (
        <Die2D
          id={`${key}-${die.id}`}
          value={die.value}
          size={25}
        />
      ))}
    </View>
  );
}

function ScoredDice() {
  const { rolls } = useGameStore();
  return (
    <View style={styles.scoredDice}>
      {rolls.map((roll, index) => (
        <RollResultView key={`roll-${index}`} roll={roll} />
      ))}
    </View>
  );
}

function KeepDiceButton() {
  const { dice, completeRoll, permissions } = useGameStore();
  // How many dice are still resting after holds.
  const restingDice = dice.filter((die) => die.status === DieStatus.RESTING);
  const numResting = restingDice.length > 0 ? restingDice.length : 5;
  return (
    <Button title={`Roll ${numResting} Dice`} onPress={completeRoll} disabled={!permissions.canCompleteRoll} />
  );
}

function StartTurnButton() {
  const { advancePlayer, permissions } = useGameStore();
  return (
    <Button title="Next Player" onPress={advancePlayer} disabled={!permissions.canAdvancePlayer} />
  );
}

function BankPointsButton() {
  const { bankPoints, permissions } = useGameStore();
  return (
    <Button title="Bank Points" onPress={bankPoints} disabled={!permissions.canBankPoints} />
  );
}

// Display the dice that have been thrown or are resting.
function Playfield() {
  const { dice, toggleHold, permissions } = useGameStore();
  // Filter to only active dice while preserving the original order
  const activeDice = dice.filter((die) =>
    die.status === DieStatus.ROLLING ||
    die.status === DieStatus.RESTING ||
    die.status === DieStatus.HELD
  );

  console.log('Playfield', dice, permissions);

  const handleHold = (id: string) => {
    if (!permissions.canHoldDice) {
      return;
    }
    toggleHold(id);
  };

  return (
    <View style={styles.playfield}>
      {activeDice.map((die) => (
        <Die2D
          key={die.id}
          id={die.id}
          value={die.value}
          size={100}
          isHeld={die.status === DieStatus.HELD}
          onHold={handleHold} />
      ))}
    </View>
  );
}

function Game() {
  const { permissions, round } = useGameStore();

  if (round === 0) {
    return null;
  }

  return (
    <>
      <Scoreboard />
      <Text style={styles.text}>Round {round}</Text>
      <TurnStatus />
      <ScoredDice />
      <Playfield />
      {permissions.canThrowDie && <ThrowDieButton />}
      <RollingSimulator />
      {permissions.canCompleteRoll && <KeepDiceButton />}
      {permissions.canStartTurn && <StartTurnButton />}
      {permissions.canBankPoints && <BankPointsButton />}
      <QuitGameButton />
    </>
  );
}

export default function Gameplay() {
  return (
    <View style={styles.container}>
      <PreGame />
      <Game />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scoreboard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  player: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentPlayer: {
    outlineWidth: 4,
    outlineColor: 'yellow',
    outlineStyle: 'solid',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    margin: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  score: {
    fontSize: 20,
  },
  form: {
    flexDirection: 'column',
    gap: 10,
  },
  formGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
  },
  turnStatus: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 10,
  },
  playfield: {
    height: 120,
    flexDirection: 'row',
    flexWrap: 'wrap',
    flexGrow: 1,
    justifyContent: 'center',
    gap: 20,
    padding: 10,
    backgroundColor: 'green',
  },
  scoredDice: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 60,
    gap: 20,
    padding: 10,
    backgroundColor: '#999999',
  },
  rollResult: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 10,
    backgroundColor: 'blue',
  }
});