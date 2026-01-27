import { RollResult } from "@/model/state";
import useGameStore from "@/model/useGameStore";
import { StyleSheet, View } from "react-native";
import Die2D from "./Die2D";

function RollResultView({ rollId, roll }: { rollId: string, roll: RollResult }) {
  return (
    <View key={rollId} style={styles.rollResult}>
      {roll.dice.map((die) => (
        <Die2D
          id={`${rollId}-${die.id}`}
          value={die.value}
          size={25}
        />
      ))}
    </View>
  );
}

export default function ScoredDice() {
  const { rolls } = useGameStore();
  return (
    <View style={styles.scoredDice}>
      {rolls.map((roll, index) => (
        <RollResultView rollId={`roll-${index}`} roll={roll} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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