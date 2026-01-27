/**
 * This page is to prototype the gameplay of zonk. The goals are:
 * - Define the state of the game, which we will then refactor into a separate file.
 * - Define the rules of the game, which in turn define what actions are available to the player.
 * - Define the scoring system.
 * - Explore game rule variations, and how we can offer those as settings of the game.
 * - Simulate multi-player games (as a pass and play mode on the single app...for now)
 */

import { BankPointsButton, KeepDiceButton, QuitGameButton, RematchButton, StartNewGameButton, StartTurnButton, ThrowDieButton } from '@/components/ActionButtons';
import Die2D from '@/components/Die2D';
import PreGame from '@/components/PreGame';
import RollingSimulator from '@/components/RollingSimulator';
import Scoreboard from '@/components/Scoreboard';
import ScoredDice from '@/components/ScoredDice';
import TurnStatus from '@/components/TurnStatus';
import Winner from '@/components/Winner';
import { DieStatus } from '@/model/state';
import useGameStore from '@/model/useGameStore';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Display the dice that have been thrown or are resting.
function Playfield() {
  const { dice, toggleHold, permissions } = useGameStore();
  // Filter to only active dice while preserving the original order
  const activeDice = dice.filter((die) =>
    die.status === DieStatus.ROLLING ||
    die.status === DieStatus.RESTING ||
    die.status === DieStatus.HELD
  );

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
  const { round } = useGameStore();

  if (round === 0) {
    return null;
  }

  return (
    <>
      <Scoreboard />
      <Text style={styles.text}>Round {round}</Text>
      <TurnStatus />
      <Winner />
      <ScoredDice />
      <Playfield />
      <ThrowDieButton />
      <RollingSimulator />
      <KeepDiceButton />
      <StartTurnButton />
      <BankPointsButton />
      <QuitGameButton />
      <RematchButton />
      <StartNewGameButton />
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
});