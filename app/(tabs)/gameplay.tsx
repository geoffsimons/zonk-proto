/**
 * This page is to prototype the gameplay of zonk. The goals are:
 * - Define the state of the game, which we will then refactor into a separate file.
 * - Define the rules of the game, which in turn define what actions are available to the player.
 * - Define the scoring system.
 * - Explore game rule variations, and how we can offer those as settings of the game.
 * - Simulate multi-player games (as a pass and play mode on the single app...for now)
 */

import useGameStore from '@/model/useGameStore';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { nanoid } from 'nanoid';

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
        <View style={styles.player} key={player.id}>
          <Text style={styles.name}>{player.name}</Text>
          <Button title="Remove Player" onPress={() => removePlayer(player.id)} />
        </View>
      ))}
    </>
  );
}

function QuitGameButton() {
  const { quitGame } = useGameStore();

  const showConfirmDialog = () => {
    console.log('showConfirmDialog...');
    Alert.alert(
      'Quit Game',
      'Are you sure you want to quit the game?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Quit', style: 'destructive', onPress: quitGame },
      ]
    );
  };
  return (
    <Button title="Quit Game" onPress={showConfirmDialog} />
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

function Game() {
  const { permissions, round, startGame } = useGameStore();

  if (round === 0) {
    return null;
  }

  return (
    <>
      <Scoreboard />
      <Text style={styles.text}>Game</Text>
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
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
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
});