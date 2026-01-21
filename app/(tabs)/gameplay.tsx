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
import { DieStatus } from '@/model/state';
import { nanoid } from 'nanoid';
import Svg, { Circle, Rect } from 'react-native-svg';

function Scoreboard() {
  const { players } = useGameStore();
  return (
    <View style={styles.scoreboard}>
      {players.map((player) => (
        <View style={styles.player} key={player.id}>
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.score}>{player.score}</Text>
        </View>
      ))}
    </View>
  );
}

function TurnStatus() {
  const { dice, currentPlayerIndex, players, points, level } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];
  const diceInHand = dice.filter((die) => die.status === DieStatus.IN_HAND);
  return (
    <View style={styles.turnStatus}>
      <Text style={styles.text}>{currentPlayer.name}'s Turn</Text>
      <Text style={styles.text}>Level {level}</Text>
      <Text style={styles.text}>Points {points}</Text>
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
      <Text style={styles.text}>Add Player</Text>
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
        <Text style={styles.text}>Pre-Game</Text>
        <AddPlayerForm />
        <PlayerList />
        <Button title="Start Game" disabled={!permissions.canStartGame} onPress={startGame} />
      </View>
    );
  }
  return null;
}

function Die2D({ id, value, size, isHeld, onHold }: { id: string, value: number, size: number, isHeld: boolean, onHold: (id: string) => void }) {
  const dots = getDotsForNumber(value);
  console.log('Die2D', id, value, size, dots);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} onPress={() => onHold(id)}>
      {isHeld && (
        <Rect
          key={`rect-${id}`}
          x={0}
          y={0}
          width={size}
          height={size}
          fill="yellow"
        />
      )}
      <Rect
        key={`rect-${id}`}
        x={5}
        y={5}
        width={size - 10}
        height={size - 10}
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
    console.log('Rolling dice', rollingDice);


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

// Display the dice that have been thrown or are resting.
function Playfield() {
  const { dice, toggleHold, permissions } = useGameStore();
  const rollingDice = dice.filter((die) => die.status === DieStatus.ROLLING);
  const restingDice = dice.filter((die) => die.status === DieStatus.RESTING);
  const heldDice = dice.filter((die) => die.status === DieStatus.HELD);
  const activeDice = [...rollingDice, ...restingDice, ...heldDice];

  console.log('Playfield', dice, permissions);

  const handleHold = (id: string) => {
    console.log('handleHold', id);
    if (!permissions.canHoldDice) {
      console.log('cannot hold die');
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
      <Text style={styles.text}>Game</Text>
      <Scoreboard />
      <TurnStatus />
      <Playfield />
      {permissions.canThrowDie && <ThrowDieButton />}
      <RollingSimulator />
      <QuitGameButton />
    </>
  );
}

export default function Gameplay() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Zonk</Text>
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
    fontSize: 40,
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
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
  },
  turnStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  playfield: {
    height: 120,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    padding: 10,
    backgroundColor: 'green',
  },
});