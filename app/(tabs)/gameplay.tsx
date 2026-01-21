/**
 * This page is to prototype the gameplay of zonk. The goals are:
 * - Define the state of the game, which we will then refactor into a separate file.
 * - Define the rules of the game, which in turn define what actions are available to the player.
 * - Define the scoring system.
 * - Explore game rule variations, and how we can offer those as settings of the game.
 * - Simulate multi-player games (as a pass and play mode on the single app...for now)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Gameplay() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Zonk</Text>
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
});