import useGameStore from "@/model/useGameStore";
import { StyleSheet, Text, View } from "react-native";
import IconButton from "./IconButton";

export default function PlayerList() {
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

const styles = StyleSheet.create({
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
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
  },
});