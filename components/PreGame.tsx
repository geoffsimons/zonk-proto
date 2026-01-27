import useGameStore from "@/model/useGameStore";
import { Button, StyleSheet, View } from "react-native";
import AddPlayerForm from "./AddPlayerForm";
import PlayerList from "./PlayerList";

export default function PreGame() {
  const { permissions, round, startGame } = useGameStore();

  if (round === 0) {
    return (
      <View style={styles.preGame}>
        <AddPlayerForm />
        <PlayerList />
        <Button title="Start Game" disabled={!permissions.canStartGame} onPress={startGame} />
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  preGame: {
    flex: 1,
    backgroundColor: '#25292e',
  },
});