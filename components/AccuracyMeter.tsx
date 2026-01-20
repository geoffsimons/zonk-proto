import { StyleSheet, View } from "react-native";

export default function AccuracyMeter({ accuracy }: { accuracy: number }) {
  return (
    <View style={styles.accuracyMeterBarBackground}>
      <View style={[styles.accuracyMeterBarCover, { width: `${100 - accuracy * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  accuracyMeterBarBackground: {
    width: '100%',
    height: 20,
    backgroundImage: 'linear-gradient(to right, #0000FF, #00FF00, #FF0000)',
  },
  accuracyMeterBarCover: {
    width: '100%',
    height: 20,
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
  },
});