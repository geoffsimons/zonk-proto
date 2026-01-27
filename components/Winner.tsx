import useGameStore from "@/model/useGameStore";
import { StyleSheet, Text, View } from "react-native";

export default function Winner() {
  const { winner } = useGameStore();

  if (!winner) {
    return null;
  }

  return (
    <View style={styles.winner}>
      <Text style={styles.text}>Winner: {winner?.name ?? 'Unknown'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  winner: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});