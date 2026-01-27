import { getLevelLabel, getTurnStateLabel } from "@/lib/labels";
import { DieStatus, TurnState } from "@/model/state";
import useGameStore from "@/model/useGameStore";
import { StyleSheet, Text, View } from "react-native";

function BustedMessage() {
  const { level } = useGameStore();
  return (
    <View style={styles.bustedContainer}>
      <Text style={styles.bustedText}>{getLevelLabel(level)}</Text>
    </View>
  );
}

export default function GameStatus() {
  const { dice, turnState, currentPlayerIndex, players, points, level, winner, holdingPoints, activePoints } = useGameStore();

  if (winner) {
    return null;
  }

  if (turnState === TurnState.BUSTED) {
    return <BustedMessage />;
  }

  const currentPlayer = players[currentPlayerIndex];
  const diceInHand = dice.filter((die) => die.status === DieStatus.IN_HAND);
  return (
    <View style={styles.turnStatus}>
      <View style={styles.statusRow}>
        <Text style={styles.text}>Player {currentPlayer.name}: {getTurnStateLabel(turnState)}</Text>
        <Text style={styles.text}>In {getLevelLabel(level)}</Text>
      </View>
      <View style={styles.statusRow}>
        <Text style={styles.text}>Points: {points}</Text>
        <Text style={styles.text}>Holding: {holdingPoints} of {activePoints}</Text>
      </View>
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
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bustedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  bustedText: {
    color: 'red',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
  },
});