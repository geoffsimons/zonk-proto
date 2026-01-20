import Slider from "@react-native-community/slider";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function PowerControl({ initialPower, onPowerChange }: { initialPower: number, onPowerChange: (power: number) => void }) {
  const handlePowerChange = (value: number) => {
    onPowerChange(value);
  };

  useEffect(() => {
    onPowerChange(initialPower);
  }, [initialPower]);

  return (
    <View style={styles.powerControl}>
      <Text style={styles.powerLabel}>Power</Text>
      <Slider
        style={styles.powerSlider}
        value={initialPower}
        onValueChange={handlePowerChange}
        minimumValue={0}
        maximumValue={100}
        step={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  powerControl: {
    flex: 1,
    backgroundColor: '#25292e',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: 'red',
  },
  powerLabel: {
    color: '#fff',
  },
  powerSlider: {
    width: 200,
    height: 40,
  },
});

