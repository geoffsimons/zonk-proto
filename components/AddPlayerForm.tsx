import useGameStore from "@/model/useGameStore";
import { nanoid } from "nanoid";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function AddPlayerForm() {
  const { addPlayer, permissions } = useGameStore();
  const [name, setName] = useState('');

  const handleAddPlayer = () => {
    addPlayer(nanoid(), name);
    setName('');
  };

  const isPlayerNameValid = permissions.canAddPlayer(name);

  return (
    <>
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

const styles = StyleSheet.create({
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
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
  },
});