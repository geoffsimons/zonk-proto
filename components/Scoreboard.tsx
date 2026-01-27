import useGameStore from "@/model/useGameStore";
import { StyleSheet, Text, View } from "react-native";

export default function Scoreboard() {
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

const styles = StyleSheet.create({
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
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  score: {
    fontSize: 20,
  },
});