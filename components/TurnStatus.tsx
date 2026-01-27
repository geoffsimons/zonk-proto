import { pointsForDice } from "@/model/rules";
import { DieStatus } from "@/model/state";
import useGameStore from "@/model/useGameStore";
import { StyleSheet, Text, View } from "react-native";

export default function TurnStatus() {
  const { dice, turnState, currentPlayerIndex, players, points, level, winner } = useGameStore();

  if (winner) {
    return null;
  }

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

const styles = StyleSheet.create({
  turnStatus: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 10,
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});